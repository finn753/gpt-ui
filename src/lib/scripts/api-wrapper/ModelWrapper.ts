import OpenAI from "openai";
import { type Message as OllamaMessage, Ollama } from "ollama/browser";
import { get } from "svelte/store";
import { mistralApiKey, openaiApiKey } from "$lib/scripts/misc/stores";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { LiveDataSource } from "$lib/scripts/misc/types";
import { injectLiveDataSourceIntoMessages } from "$lib/scripts/chat/live-data-sources";
import MistralClient, { type Message as MistralMessage } from "@mistralai/mistralai";

export type ModelOptions = {
	temperature?: number;
	topP?: number;
};

export type ModelResponse = {
	content: string;
	finished: boolean;
};

export type MessageFormat = {
	role: "user" | "assistant" | "system";
	content: string;
	images?: string[];
};

export class ModelWrapper {
	public readonly modelId: string;
	public readonly provider: string;
	public readonly modelName: string;
	private _params: ModelOptions = {};
	private readonly model: OpenAI | Ollama | MistralClient;

	private _liveDataSources: LiveDataSource[] = [];

	constructor(modelId: string, options?: ModelOptions) {
		options = {
			temperature: Number(options?.temperature) || undefined,
			topP: Number(options?.topP) || undefined
		};

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
			case "mistral":
				this.model = new MistralClient(get(mistralApiKey) ?? "");
				break;
			default:
				throw new Error(`Provider ${this.provider} not supported`);
		}
	}

	public set params(options: ModelOptions) {
		this._params = options;
	}

	public set liveDataSources(sources: LiveDataSource[]) {
		this._liveDataSources = sources;
	}

	async *getOpenAIStream(messages: MessageFormat[]): AsyncGenerator<ModelResponse> {
		if (!(this.model instanceof OpenAI)) throw new Error("Model is not an instance of OpenAI");

		const response = await this.model.chat.completions.create({
			model: this.modelName,
			...this._params,
			messages: this.messagesToOpenAIFormat(messages),
			stream: true
		});

		let content = "";

		for await (const chunk of response) {
			content = content + (chunk.choices[0].delta.content || "");

			if (chunk.choices[0].finish_reason) {
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

		const stream = await this.model.chat({
			model: this.modelName,
			stream: true,
			messages: this.messagesToOllamaFormat(messages),
			options: {
				...this._params
			}
		});

		let content = "";

		for await (const chunk of stream) {
			content = content + chunk.message.content;

			yield { content, finished: chunk.done };
		}
	}

	async *getMistralStream(messages: MessageFormat[]): AsyncGenerator<ModelResponse> {
		if (!(this.model instanceof MistralClient))
			throw new Error("Model is not an instance of Mistral");

		const stream = this.model.chatStream({
			messages: this.messagesToMistralFormat(messages),
			model: this.modelName,
			...this._params
		});

		let content = "";

		for await (const chunk of stream) {
			content = content + chunk.choices[0].delta.content;

			yield { content, finished: chunk.choices[0].finish_reason !== undefined };
		}
	}

	async getStream(messages: MessageFormat[]) {
		switch (this.provider) {
			case "openai":
				return this.getOpenAIStream(messages);
			case "ollama":
				return this.getOllamaStream(messages);
			case "mistral":
				return this.getMistralStream(messages);
			default:
				throw new Error(`Provider ${this.provider} not supported`);
		}
	}

	public async prompt(input: string, system?: string) {
		const messages: MessageFormat[] = [{ role: "user", content: input }];

		if (system) messages.unshift({ role: "system", content: system });

		const stream = await this.getStream(messages);

		let response = "";
		for await (const chunk of stream) {
			response = chunk.content;
		}

		return response;
	}

	public async *streamToolAgentResponse(
		messages: MessageFormat[]
	): AsyncGenerator<MessageFormat[]> {
		messages = [...messages];
		const context: MessageFormat[] = [];

		messages = await injectLiveDataSourceIntoMessages(messages, this._liveDataSources);

		const response = await this.getStream(messages);

		let last: MessageFormat | undefined;

		for await (const chunk of response) {
			yield [...context, { role: "assistant", content: chunk.content }];
			last = { role: "assistant", content: chunk.content };
		}

		if (last) context.push(last);
		return context;
	}

	private messagesToOpenAIFormat(messages: MessageFormat[]): ChatCompletionMessageParam[] {
		return messages.map((message) => {
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
		}) as ChatCompletionMessageParam[];
	}

	private messagesToOllamaFormat(messages: MessageFormat[]): OllamaMessage[] {
		return messages.map((message) => {
			return {
				role: message.role,
				content: message.content,
				images:
					message.images?.map((image) => image.replace(/^data:image\/\w+;base64,/, "")) || undefined
			};
		});
	}

	private messagesToMistralFormat(messages: MessageFormat[]): MistralMessage[] {
		return messages.map((message) => {
			return {
				role: message.role,
				content: message.content
			};
		});
	}
}
