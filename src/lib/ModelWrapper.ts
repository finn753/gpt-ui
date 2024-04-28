import OpenAI from "openai";
import { Ollama } from "ollama/browser";
import { get } from "svelte/store";
import { openaiApiKey } from "$lib/stores";
import type { FunctionDefinition } from "openai/resources/shared";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import * as errorHandler from "$lib/errorHandler";

export type ModelOptions = {
	temperature?: number;
	topP?: number;
};

export type ModelFunction = {
	definition: FunctionDefinition;
	call: (args: Record<string, unknown>) => Promise<string>;
};

export type ModelResponse = {
	content: string;
	functionCalls: OpenAI.Chat.ChatCompletionMessageToolCall[];
	finished: boolean;
};

export type MessageFormat = {
	role: "user" | "assistant" | "tool" | "system" | "function";
	content: string;
	tool_calls?: OpenAI.Chat.ChatCompletionMessageToolCall[];
	tool_call_id?: string;
	images?: string[];
};

export class ModelWrapper {
	public readonly modelId: string;
	public readonly provider: string;
	public readonly modelName: string;
	private _params: ModelOptions = {};
	private readonly model: OpenAI | Ollama;

	private _functions: Record<string, ModelFunction> = {};

	constructor(modelId: string, options?: ModelOptions) {
		this.modelId = modelId;
		[this.provider, this.modelName] = modelId.split(":");
		this._params = options || this._params;

		switch (this.provider) {
			case "openai":
				this.model = new OpenAI({
					apiKey: get(openaiApiKey) ?? undefined,
					dangerouslyAllowBrowser: true
				});
				break;
			case "ollama":
				this.model = new Ollama();
				break;
			default:
				throw new Error(`Provider ${this.provider} not supported`);
		}
	}

	public set functions(functions: Record<string, ModelFunction>) {
		this._functions = functions;
	}

	public set params(options: ModelOptions) {
		this._params = options;
	}

	async *getOpenAIStream(messages: MessageFormat[]): AsyncGenerator<ModelResponse> {
		if (!(this.model instanceof OpenAI)) throw new Error("Model is not an instance of OpenAI");

		const response = await this.model.chat.completions.create({
			model: this.modelName,
			...this._params,
			messages: messages.map((message) => {
				const content: ChatCompletionMessageParam["content"] = [
					{ type: "text", text: message.content }
				];
				message.images?.forEach((image) =>
					content.push({ type: "image_url", image_url: { url: image } })
				);

				return {
					...message,
					content,
					images: undefined
				};
			}) as ChatCompletionMessageParam[],
			tools:
				Object.keys(this._functions).length === 0
					? undefined
					: Object.values(this._functions).map((fn) => {
							return {
								type: "function",
								function: fn.definition
							};
						}),
			stream: true
		});

		const toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];
		let content = "";

		for await (const chunk of response) {
			if (chunk.choices[0].delta.tool_calls) {
				const currentToolCall = chunk.choices[0].delta.tool_calls[0];

				if (!toolCalls[currentToolCall.index]) {
					toolCalls[currentToolCall.index] =
						currentToolCall as OpenAI.ChatCompletionMessageToolCall;
				} else {
					toolCalls[currentToolCall.index].function.arguments +=
						currentToolCall.function?.arguments || "";
				}
			}

			content = content + (chunk.choices[0].delta.content || "");

			if (chunk.choices[0].finish_reason) {
				console.error("Finish", chunk.choices[0].finish_reason);
				yield { content, functionCalls: toolCalls, finished: true };
				break;
			}

			yield { content, functionCalls: toolCalls, finished: false };
		}

		return {
			content,
			functionCalls: toolCalls,
			finished: true
		};
	}

	async *getOllamaStream(messages: MessageFormat[]): AsyncGenerator<ModelResponse> {
		if (!(this.model instanceof Ollama)) throw new Error("Model is not an instance of Ollama");

		const stream = await this.model.chat({
			model: this.modelName,
			stream: true,
			messages: messages.map((message) => {
				return {
					role: message.role,
					content: message.content,
					images:
						message.images?.map((image) => image.replace(/^data:image\/\w+;base64,/, "")) ||
						undefined
				};
			})
		});

		const toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];
		let content = "";

		for await (const chunk of stream) {
			content = content + chunk.message.content;

			yield { content, functionCalls: toolCalls, finished: false };
		}
	}

	async getStream(messages: MessageFormat[]) {
		switch (this.provider) {
			case "openai":
				return this.getOpenAIStream(messages);
			case "ollama":
				return this.getOllamaStream(messages);
			default:
				throw new Error(`Provider ${this.provider} not supported`);
		}
	}

	public async *streamToolAgentResponse(
		messages: MessageFormat[]
	): AsyncGenerator<MessageFormat[]> {
		messages = [...messages];
		const context: MessageFormat[] = [];

		console.error("Stream Messages", messages);
		const response = await this.getStream(messages);

		let last: MessageFormat | undefined;

		for await (const chunk of response) {
			const toolCalls = chunk.functionCalls;

			if (chunk.finished && toolCalls.length > 0) {
				const assistantMessage: MessageFormat = {
					role: "assistant",
					content: "",
					tool_calls: toolCalls.length > 0 ? toolCalls : undefined
				};

				context.push(assistantMessage);
				yield context;

				context.push(...(await this.executeToolCalls(toolCalls)));
				yield context;

				console.error("Messages", messages);
				console.error("Context", context);
				console.error("Combined", [...messages, ...context]);
				const toolResponse = this.streamToolAgentResponse([...messages, ...context]);

				let finalContext: MessageFormat[] = [];
				for await (const toolChunk of toolResponse) {
					console.error("ToolChunk", toolChunk);
					yield [...context, ...toolChunk];
					finalContext = toolChunk;
				}

				return [...context, ...finalContext];
			}

			yield [...context, { role: "assistant", content: chunk.content }];
			last = { role: "assistant", content: chunk.content };
		}

		if (last) context.push(last);
		return context;
	}

	async executeToolCalls(toolCalls: OpenAI.ChatCompletionMessageToolCall[]) {
		const context: MessageFormat[] = [];

		for (const toolCall of toolCalls) {
			const functionName = toolCall.function?.name;
			const functionArgs = toolCall.function?.arguments;

			if (!functionName) continue;

			try {
				const fn = this._functions[functionName].call;
				const result = await fn(JSON.parse(functionArgs || "{}"));

				context.push({
					tool_call_id: toolCall.id as string,
					role: "tool",
					name: functionName,
					content: result
				});
			} catch (e: unknown) {
				errorHandler.handleError("Failed to execute tool", e);
			}
		}
		return context;
	}
}
