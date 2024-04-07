import type { MessageStructure } from "$lib/types";
import OpenAI from "openai";
import { get } from "svelte/store";
import { lastContextOfChat, openaiApiKey, selectedChatID } from "$lib/stores";
import { toast } from "svelte-sonner";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function generateTitle(context: MessageStructure[]) {
	const messages = [
		{
			role: "system",
			content:
				"You're an AI that generates titles for chats \n Keep them short, summarise the chat, don't be too specific \n" +
				"Don't enumerate the points, don't use the word 'chat' in the title \n" +
				"SUMMARIZE the chat in a few words"
		},
		{
			role: "user",
			content: JSON.stringify(context)
		}
	];

	let openai: OpenAI;

	try {
		openai = new OpenAI({
			apiKey: get(openaiApiKey) || "",
			dangerouslyAllowBrowser: true
		});
	} catch (e: unknown) {
		toast.error("Failed to initialize OpenAI");
		console.error("Failed to initialize OpenAI", e);
		return;
	}

	const completion = await openai.chat.completions.create({
		messages: messages as ChatCompletionMessageParam[],
		model: "gpt-3.5-turbo"
	});

	return completion.choices[0].message.content?.replace(/"/g, "");
}

export async function generateSummary(currentSummary: string, newMessages: MessageStructure[]) {
	const messages = [
		{
			role: "system",
			content:
				"You're an AI that generates summaries for chats \n Keep them short, summarise the chat, don't be too specific \n" +
				"Don't enumerate the points, don't use the word 'chat' in the summary \n" +
				"DO NOT say 'The user said', 'The assistant said', etc. \n" +
				"SUMMARIZE the chat in a few words, one sentence maximum \n"
		},
		{
			role: "user",
			content:
				"Current summary: \n " +
				currentSummary +
				"\n\n" +
				"Messages: \n" +
				JSON.stringify(newMessages)
		}
	];

	let openai: OpenAI;

	try {
		openai = new OpenAI({
			apiKey: get(openaiApiKey) || "",
			dangerouslyAllowBrowser: true
		});
	} catch (e: unknown) {
		toast.error("Failed to initialize OpenAI");
		console.error("Failed to initialize OpenAI", e);
		return;
	}

	return await openai.chat.completions
		.create({
			messages: messages as ChatCompletionMessageParam[],
			model: "gpt-3.5-turbo"
		})
		.then((res) => res.choices[0].message.content);
}

export async function* generateResponse(
	context: MessageStructure[],
	model?: string,
	temperature?: number,
	top_p?: number,
	systemMessage?: string
): AsyncGenerator<MessageStructure | undefined> {
	model = model || "gpt-3.5-turbo";
	temperature = parseFloat(String(temperature)) || 0.5;
	top_p = parseFloat(String(top_p)) || 1;
	systemMessage = systemMessage || "";

	lastContextOfChat.update((curr) => {
		return {
			...curr,
			[get(selectedChatID) as string]: context
		};
	});

	let messages = context.map((message) => {
		return {
			role: message.role as string,
			content: message.content
		};
	});

	messages = [
		{
			role: "system",
			content: systemMessage
		},
		...messages
	];

	const responseMessage: MessageStructure = {
		chat_id: "",
		content: "",
		role: "assistant",
		model: model,
		created_at: new Date()
	};

	let openai: OpenAI;

	try {
		openai = new OpenAI({
			apiKey: get(openaiApiKey) || "",
			dangerouslyAllowBrowser: true
		});
	} catch (e: unknown) {
		toast.error("Failed to initialize OpenAI");
		console.error("Failed to initialize OpenAI", e);
		return;
	}

	try {
		const stream = await openai.chat.completions.create({
			messages: messages as ChatCompletionMessageParam[],
			model,
			temperature,
			top_p,
			stream: true
		});

		responseMessage.content = "";

		for await (const part of stream) {
			responseMessage.content = responseMessage.content + (part.choices[0]?.delta?.content || "");
			yield responseMessage;
		}

		return responseMessage;
	} catch (e: unknown) {
		toast.error("Failed to generate response");
		console.error("Failed to generate response", e);
		return;
	}
}
