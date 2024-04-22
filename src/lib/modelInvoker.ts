import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { ChatOpenAI } from "@langchain/openai";
import { get } from "svelte/store";
import { openaiApiKey } from "$lib/stores";
import * as errorHandler from "$lib/errorHandler";
import * as llmTools from "$lib/tools/llmTools";
import OpenAI from "openai";
import type { SpeechCreateParams } from "openai/resources/audio/speech";
import type { llmToolMap } from "$lib/tools/llmTools";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function generateChatResponse(
	messages: BaseLanguageModelInput,
	options?: { modelName?: string; temperature?: number; topP?: number }
): Promise<string | undefined> {
	const model: ChatOpenAI | null = getLangchainModel(options);
	if (!model) return;

	return (await model.invoke(messages)).content.toString();
}

export async function* streamChatResponse(
	messages: OpenAI.Chat.ChatCompletionMessageParam[],
	tools: llmToolMap,
	options?: { model?: string; temperature?: number; topP?: number }
) {
	const model: OpenAI | null = getOpenAI();
	if (!model) return;

	const response = await model.chat.completions.create({
		model: "gpt-3.5-turbo",
		...options,
		messages,
		tools: Object.values(tools).map((tool) => tool.input),
		stream: true
	});

	const toolCalls: OpenAI.ChatCompletionMessageToolCall[] = [];
	let content = "";

	for await (const chunk of response) {
		if (chunk.choices[0].delta.tool_calls) {
			const currentToolCall = chunk.choices[0].delta.tool_calls[0];

			if (!toolCalls[currentToolCall.index]) {
				toolCalls[currentToolCall.index] = currentToolCall as OpenAI.ChatCompletionMessageToolCall;
			} else {
				toolCalls[currentToolCall.index].function.arguments +=
					currentToolCall.function?.arguments || "";
			}
		}

		chunk.choices[0].delta.tool_calls =
			toolCalls as OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[];

		content = content + chunk.choices[0].delta.content;
		chunk.choices[0].delta.content = content;

		yield chunk;
	}
}

export async function* streamChatResponseWithTools(
	messages: OpenAI.Chat.ChatCompletionMessageParam[],
	tools: llmToolMap,
	options?: { model?: string; temperature?: number; topP?: number }
) {
	const response = streamChatResponse(messages, tools, options);

	for await (const chunk of response) {
		const toolCalls = chunk.choices[0].delta.tool_calls as OpenAI.ChatCompletionMessageToolCall[];

		if (chunk.choices[0].finish_reason === "tool_calls" && toolCalls) {
			yield chunk;

			const assistantMessage: OpenAI.ChatCompletionMessageParam = {
				role: "assistant",
				content: "",
				tool_calls: toolCalls
			};

			messages.push(assistantMessage);

			messages.push(...(await llmTools.executeToolCalls(toolCalls, tools)));

			const toolResponse = streamChatResponse(messages, tools, options);

			for await (const toolChunk of toolResponse) {
				toolChunk.choices[0].delta.tool_calls =
					toolCalls as OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[];

				yield toolChunk;
			}

			break;
		}
		yield chunk;
	}
}

export async function* streamToolAgentResponse(
	messages: OpenAI.Chat.ChatCompletionMessageParam[],
	tools: llmToolMap,
	options?: { model?: string; temperature?: number; topP?: number }
): AsyncGenerator<ChatCompletionMessageParam[]> {
	const context: ChatCompletionMessageParam[] = [];

	const response = streamChatResponse(messages, tools, options);

	let last: ChatCompletionMessageParam | undefined;

	for await (const chunk of response) {
		const toolCalls = chunk.choices[0].delta.tool_calls as OpenAI.ChatCompletionMessageToolCall[];

		if (chunk.choices[0].finish_reason === "tool_calls" && toolCalls) {
			const assistantMessage: OpenAI.ChatCompletionMessageParam = {
				role: "assistant",
				content: "",
				tool_calls: toolCalls
			};

			context.push(assistantMessage);
			yield context;

			context.push(...(await llmTools.executeToolCalls(toolCalls, tools)));
			yield context;

			const toolResponse = streamToolAgentResponse([...messages, ...context], tools, options);

			let finalContext: ChatCompletionMessageParam[] = [];
			for await (const toolChunk of toolResponse) {
				yield [...context, ...toolChunk];
				finalContext = toolChunk;
			}

			return [...context, ...finalContext];
		}

		chunk.choices[0].delta.role = "assistant";
		yield [...context, chunk.choices[0].delta as ChatCompletionMessageParam];
		last = chunk.choices[0].delta as ChatCompletionMessageParam;
	}

	if (last) context.push(last);
	return context;
}

function getLangchainModel(options?: { modelName?: string; temperature?: number; topP?: number }) {
	try {
		const model = new ChatOpenAI(
			{
				openAIApiKey: get(openaiApiKey) || ""
			},
			{ dangerouslyAllowBrowser: true }
		);

		model.modelName = options?.modelName || "gpt-3.5-turbo";
		model.temperature = options?.temperature || 0.5;
		model.topP = options?.topP || 1;

		return model;
	} catch (e: unknown) {
		errorHandler.handleError("Failed to initialize OpenAI", e);
		return null;
	}
}

export async function generateImage(prompt: string, model = "dall-e-2") {
	const openai: OpenAI | null = getOpenAI();
	if (!openai) return;

	try {
		const completion = await openai.images.generate({
			model,
			prompt,
			quality: "standard",
			response_format: "b64_json",
			size: "1024x1024",
			style: "vivid"
		});

		return completion.data[0];
	} catch (e: unknown) {
		errorHandler.handleError("Failed to generate image", e);
		return;
	}
}

export async function generateVoice(input: string, voice: string) {
	const openai: OpenAI | null = getOpenAI();
	if (!openai) return;

	try {
		const mp3 = await openai.audio.speech.create(<SpeechCreateParams>{
			model: "tts-1",
			voice,
			input
		});

		const buffer = await mp3.arrayBuffer();
		const uint8Array = new Uint8Array(buffer);
		return btoa(String.fromCharCode.apply(null, uint8Array as unknown as number[]));
	} catch (e: unknown) {
		errorHandler.handleError("Failed to generate voice", e);
		return;
	}
}

function getOpenAI() {
	try {
		return new OpenAI({
			apiKey: get(openaiApiKey) || "",
			dangerouslyAllowBrowser: true
		});
	} catch (e: unknown) {
		errorHandler.handleError("Failed to initialize OpenAI", e);
		return null;
	}
}
