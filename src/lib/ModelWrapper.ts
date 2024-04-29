import OpenAI from "openai";
import { Ollama } from "ollama/browser";
import { get } from "svelte/store";
import { openaiApiKey } from "$lib/stores";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type ModelOptions = {
	temperature?: number;
	topP?: number;
};

export type ModelResponse = {
	content: string;
	finished: boolean;
};

export type MessageFormat = {
	role: "user" | "assistant" | "tool" | "system" | "function";
	content: string;
	images?: string[];
};

export class ModelWrapper {
	public readonly modelId: string;
	public readonly provider: string;
	public readonly modelName: string;
	private _params: ModelOptions = {};
	private readonly model: OpenAI | Ollama;

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
			stream: true
		});

		let content = "";

		for await (const chunk of response) {
			content = content + (chunk.choices[0].delta.content || "");

			if (chunk.choices[0].finish_reason) {
				console.error("Finish", chunk.choices[0].finish_reason);
				yield { content, finished: true };
				break;
			}

			yield { content, finished: false };
		}

		return {
			content,
			finished: true
		};
	}

	async *getOllamaStream(messages: MessageFormat[]): AsyncGenerator<ModelResponse> {
		if (!(this.model instanceof Ollama)) throw new Error("Model is not an instance of Ollama");

		messages = messages.map((message) => {
			return {
				...message,
				role: message.role === "tool" ? "user" : message.role
			};
		});

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

		let content = "";

		for await (const chunk of stream) {
			content = content + chunk.message.content;

			yield { content, finished: chunk.done };
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

		const response = await this.getStream(messages);

		let last: MessageFormat | undefined;

		for await (const chunk of response) {
			yield [...context, { role: "assistant", content: chunk.content }];
			last = { role: "assistant", content: chunk.content };
		}

		if (last) context.push(last);
		return context;
	}
}
