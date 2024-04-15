import type { MessageStructure } from "$lib/types";
import OpenAI from "openai";
import { get } from "svelte/store";
import { openaiApiKey, selectedChatID } from "$lib/stores";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import * as errorHandler from "$lib/errorHandler";
import * as chatOperations from "$lib/chatOperations";
import * as templates from "$lib/templates";
import type { SpeechCreateParams } from "openai/resources/audio/speech";

const STANDARD_MODEL = "gpt-3.5-turbo";

export async function generateTitle(context: string) {
	const messages = templates.getSingleTaskPromptMessages(
		"You're an AI that generates titles for chats \n Keep them short, summarise the chat, don't be too specific \n" +
			"Don't enumerate the points, don't use the word 'chat' in the title \n" +
			"SUMMARIZE the chat in a few words",
		context
	);

	const openai: OpenAI | null = getOpenAI();
	if (!openai) return;

	return (await generateChatCompletion(openai, messages))?.replace(/"/g, "");
}

export async function generateSummary(currentSummary: string, newMessages: MessageStructure[]) {
	const messages = templates.getSingleTaskPromptMessages(
		"You're an AI that generates summaries for chats \n Keep them short, summarise the chat, don't be too specific \n" +
			"Don't enumerate the points, don't use the word 'chat' in the summary \n" +
			"DO NOT say 'The user said', 'The assistant said', etc. \n" +
			"SUMMARIZE the chat in a few words, one sentence maximum \n",
		"Current summary: \n " + currentSummary + "\n\n" + "Messages: \n" + JSON.stringify(newMessages)
	);

	const openai: OpenAI | null = getOpenAI();
	if (!openai) return;

	return await generateChatCompletion(openai, messages);
}

export async function* generateResponse(
	context: MessageStructure[],
	model?: string,
	temperature?: number,
	top_p?: number,
	systemMessage?: string,
	imageAttachments?: File[]
): AsyncGenerator<MessageStructure | undefined> {
	model = model || STANDARD_MODEL;
	temperature = parseFloat(String(temperature)) || 0.5;
	top_p = parseFloat(String(top_p)) || 1;
	systemMessage = systemMessage || "";

	chatOperations.updateLastContextOfChat(get(selectedChatID) as string, context);

	const messages = await chatMessagesToCompletionMessages(context, systemMessage, imageAttachments);

	const responseMessage: MessageStructure = templates.getAssistantResponseMessageFromModel(model);

	const openai: OpenAI | null = getOpenAI();
	if (!openai) return;

	try {
		const stream = streamChatCompletion(openai, messages, model, temperature, top_p);

		for await (const part of stream) {
			responseMessage.content = part;
			yield responseMessage;
		}

		return responseMessage;
	} catch (e: unknown) {
		errorHandler.handleError("Failed to generate response", e);
		return;
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

async function chatMessagesToCompletionMessages(
	chatMessages: MessageStructure[],
	systemMessage: string,
	imageAttachments?: File[]
): Promise<ChatCompletionMessageParam[]> {
	type ContentType =
		| { type: "text"; text: string }
		| { type: "image_url"; image_url: { url: string } };

	const messages: { role: string; content: ContentType[] }[] = chatMessages.map((message) => {
		return {
			role: message.role as string,
			content: [{ type: "text", text: message.content as string }]
		};
	});

	const base64Strings: string[] = [];

	if (imageAttachments) {
		const promises = imageAttachments.map((file) => {
			return new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const base64 = e.target?.result as string;
					resolve(base64);
				};
				reader.onerror = (e) => {
					reject(new Error(`Failed to read file: ${e.target?.error}`));
				};
				reader.readAsDataURL(file);
			});
		});

		try {
			const results = await Promise.all(promises);
			base64Strings.push(...results);
		} catch (error) {
			console.error(error);
		}
	}

	const query = messages.pop();

	base64Strings.forEach((image) => {
		query?.content.push({
			type: "image_url",
			image_url: { url: image }
		});
	});

	return [
		{
			role: "system",
			content: systemMessage
		},
		...(messages as ChatCompletionMessageParam[]),
		query as ChatCompletionMessageParam
	];
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

async function generateChatCompletion(
	openai: OpenAI,
	messages: { role: string; content: string }[],
	model = STANDARD_MODEL
) {
	const completion = await openai.chat.completions.create({
		messages: messages as ChatCompletionMessageParam[],
		model
	});

	return completion.choices[0].message.content;
}

async function* streamChatCompletion(
	openai: OpenAI,
	messages: ChatCompletionMessageParam[],
	model = STANDARD_MODEL,
	temperature = 0.5,
	top_p = 1
) {
	const stream = await openai.chat.completions.create({
		messages: messages as ChatCompletionMessageParam[],
		model,
		temperature,
		top_p,
		stream: true
	});

	let response = "";

	for await (const part of stream) {
		response = response + (part.choices[0]?.delta?.content || "");
		yield response;
	}

	return response;
}
