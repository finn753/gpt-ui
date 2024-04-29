import type { MessageStructure } from "$lib/types";
import { get } from "svelte/store";
import { selectedChatID } from "$lib/stores";
import * as errorHandler from "$lib/errorHandler";
import * as chatOperations from "$lib/chatOperations";
import { type MessageFormat, ModelWrapper } from "$lib/ModelWrapper";
import { webSearchSource, currentTimeSource, websitePreviewSource } from "$lib/liveDataSource";
import { getDefaultModelId } from "$lib/modelManager";

export async function generateTitle(context: string) {
	const systemPrompt =
		"You're an AI that generates titles for chats \n Keep them short, summarise the chat, don't be too specific \n" +
		"Don't enumerate the points, don't use the word 'chat' in the title \n" +
		"SUMMARIZE the chat in a few words";

	const model = new ModelWrapper(getDefaultModelId());
	return model.prompt(context, systemPrompt);
}

export async function generateSummary(currentSummary: string, newMessages: MessageStructure[]) {
	const systemPrompt =
		"You're an AI that generates summaries for chats \n Keep them short, summarise the chat, don't be too specific \n" +
		"Don't enumerate the points, don't use the word 'chat' in the summary \n" +
		"DO NOT say 'The user said', 'The assistant said', etc. \n" +
		"SUMMARIZE the chat in a few words, one sentence maximum \n";

	const input =
		"Current summary: \n " + currentSummary + "\n\n" + "Messages: \n" + JSON.stringify(newMessages);

	const model = new ModelWrapper(getDefaultModelId());
	return model.prompt(input, systemPrompt);
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

	try {
		const model = new ModelWrapper(modelId, options);
		model.liveDataSources = [currentTimeSource, webSearchSource, websitePreviewSource];
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
