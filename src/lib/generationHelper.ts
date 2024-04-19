import type { MessageStructure } from "$lib/types";
import { get } from "svelte/store";
import { selectedChatID } from "$lib/stores";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import * as errorHandler from "$lib/errorHandler";
import * as chatOperations from "$lib/chatOperations";
import * as templates from "$lib/templates";
import * as modelInvoker from "$lib/modelInvoker";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import type { BaseMessageLike } from "@langchain/core/messages";

const STANDARD_MODEL = "gpt-3.5-turbo";

export async function generateTitle(context: string) {
	const messages = templates.getSingleTaskPromptMessages(
		"You're an AI that generates titles for chats \n Keep them short, summarise the chat, don't be too specific \n" +
			"Don't enumerate the points, don't use the word 'chat' in the title \n" +
			"SUMMARIZE the chat in a few words",
		context
	);

	return await modelInvoker.generateChatResponse(messages);
}

export async function generateSummary(currentSummary: string, newMessages: MessageStructure[]) {
	const messages = templates.getSingleTaskPromptMessages(
		"You're an AI that generates summaries for chats \n Keep them short, summarise the chat, don't be too specific \n" +
			"Don't enumerate the points, don't use the word 'chat' in the summary \n" +
			"DO NOT say 'The user said', 'The assistant said', etc. \n" +
			"SUMMARIZE the chat in a few words, one sentence maximum \n",
		"Current summary: \n " + currentSummary + "\n\n" + "Messages: \n" + JSON.stringify(newMessages)
	);

	return await modelInvoker.generateChatResponse(messages);
}

export async function* generateResponse(
	context: MessageStructure[],
	options?: { model?: string; temperature?: number; top_p?: number },
	systemMessage?: string,
	imageAttachments?: File[]
): AsyncGenerator<MessageStructure | undefined> {
	systemMessage = systemMessage || "";

	chatOperations.updateLastContextOfChat(get(selectedChatID) as string, context);

	const langchainMessages = await langchainChatMessagesToCompletionMessages(
		context,
		systemMessage,
		imageAttachments
	);

	const responseMessage: MessageStructure = templates.getAssistantResponseMessageFromModel(
		options?.model || STANDARD_MODEL
	);

	try {
		const stream = await modelInvoker.streamChatResponse(langchainMessages, options);
		if (!stream) throw new Error("Failed to generate response");

		for await (const part of stream) {
			responseMessage.content += part.content.toString();
			yield responseMessage;
		}

		return responseMessage;
	} catch (e: unknown) {
		errorHandler.handleError("Failed to generate response", e);
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

async function langchainChatMessagesToCompletionMessages(
	chatMessages: MessageStructure[],
	systemMessage: string,
	imageAttachments?: File[]
): Promise<BaseLanguageModelInput> {
	const messages = await chatMessagesToCompletionMessages(
		chatMessages,
		systemMessage,
		imageAttachments
	);

	return messages.map((message) => {
		return [message.role, message.content] as BaseMessageLike;
	});
}
