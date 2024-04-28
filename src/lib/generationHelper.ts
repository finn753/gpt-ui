import type { MessageStructure } from "$lib/types";
import { get } from "svelte/store";
import { selectedChatID } from "$lib/stores";
import * as errorHandler from "$lib/errorHandler";
import * as chatOperations from "$lib/chatOperations";
import * as templates from "$lib/templates";
import * as modelInvoker from "$lib/modelInvoker";
import { getTavilySearchResults } from "$lib/tools/llmTools";
import { type MessageFormat, type ModelFunction, ModelWrapper } from "$lib/ModelWrapper";

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
	modelId: string,
	options?: { temperature?: number; top_p?: number },
	systemMessage?: string,
	imageAttachments?: File[]
): AsyncGenerator<MessageStructure[] | undefined> {
	systemMessage = systemMessage || "";
	context = context.map((message) => {
		if (message.role === "tool") message.role = "assistant";
		return message;
	}); // TODO - Cleaner fix

	chatOperations.updateLastContextOfChat(get(selectedChatID) as string, context);

	const messages: MessageFormat[] = await chatMessagesToCompletionMessages(
		context,
		systemMessage,
		imageAttachments
	);

	let responseMessages: MessageStructure[] = [];

	const tools: Record<string, ModelFunction> = {
		getTavilySearchResults: {
			definition: getTavilySearchResults.input.function,
			call: getTavilySearchResults.function as (args: Record<string, unknown>) => Promise<string>
		}
	};

	try {
		const model = new ModelWrapper(modelId, options);
		model.functions = tools;
		const stream = model.streamToolAgentResponse(messages);
		if (!stream) throw new Error("Failed to generate response");

		for await (const part of stream) {
			responseMessages = part.map((message) => {
				return {
					content: message.content?.toString() || "",
					role: message.role,
					model: model.modelName,
					created_at: new Date(Date.now())
				};
			});
			yield responseMessages;
		}

		return responseMessages;
	} catch (e: unknown) {
		errorHandler.handleError("Failed to generate response", e);
		return;
	}
}

async function chatMessagesToCompletionMessages(
	chatMessages: MessageStructure[],
	systemMessage: string,
	imageAttachments?: File[]
): Promise<MessageFormat[]> {
	const messages: MessageFormat[] = chatMessages.map((message) => {
		return {
			role: message.role,
			content: message.content
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

	const query = messages.pop() as MessageFormat;

	const imageList: string[] = [];
	base64Strings.forEach((image) => {
		// Strip the data URL prefix
		image = image.replace(/^data:image\/\w+;base64,/, "");
		imageList.push(image);
	});

	query.images = imageList;

	return [
		{
			role: "system",
			content: systemMessage
		},
		...messages,
		query
	];
}
