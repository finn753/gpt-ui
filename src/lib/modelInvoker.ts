import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { ChatOpenAI } from "@langchain/openai";
import { get } from "svelte/store";
import { openaiApiKey } from "$lib/stores";
import * as errorHandler from "$lib/errorHandler";
import OpenAI from "openai";
import type { SpeechCreateParams } from "openai/resources/audio/speech";

export async function generateChatResponse(
	messages: BaseLanguageModelInput,
	options?: { modelName?: string; temperature?: number; topP?: number }
): Promise<string | undefined> {
	const model: ChatOpenAI | null = getLangchainModel(options);
	if (!model) return;

	return (await model.invoke(messages)).content.toString();
}

export async function streamChatResponse(
	messages: BaseLanguageModelInput,
	options?: { modelName?: string; temperature?: number; topP?: number }
) {
	const model: ChatOpenAI | null = getLangchainModel(options);
	if (!model) return;

	return await model.stream(messages);
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
