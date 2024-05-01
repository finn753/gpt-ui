import { chatContentMap, chatDataMap } from "$lib/stores";
import { get } from "svelte/store";
import * as chatOperations from "$lib/chatOperations";
import type { ChatDataMap, ChatMessageStructure } from "$lib/types";
import * as generationHelper from "$lib/generationHelper";
import * as embeddingHelper from "$lib/embeddingHelper";
import * as templates from "$lib/templates";

export async function setGeneratedTitleForChat(chatID: string) {
	const messages = get(chatContentMap)[chatID] || [];
	const summary = get(chatDataMap)[chatID].summary;

	const newTitle = await generationHelper.generateTitle(summary || JSON.stringify(messages));
	if (newTitle) await chatOperations.changeTitle(chatID, newTitle);
}

export async function updateSummaryForChat(chatID: string) {
	if (!(await isSummaryNeededForChat(chatID))) return;

	const currentSummary = get(chatDataMap)[chatID].summary;
	const newMessages = get(chatContentMap)[chatID].slice(-6);

	const newSummary = await generationHelper.generateSummary(currentSummary, newMessages);

	if (!newSummary) return;
	await chatOperations.changeSummary(chatID, newSummary);
}

export async function sendUserMessage(chatID: string, message: string): Promise<boolean> {
	if (message.trim() === "") return false;

	const newMessage: ChatMessageStructure = {
		content: message,
		role: "user",
		model: "",
		created_at: new Date(Date.now())
	};

	return await chatOperations.sendMessage(newMessage, chatID);
}

export async function sendAssistantMessage(
	chatID: string,
	messages: ChatMessageStructure[]
): Promise<boolean> {
	messages = [...messages];

	let success = true;

	for (let i = 0; i < messages.length; i++) {
		const message = messages[i];

		success = (await chatOperations.sendMessage(message, chatID)) && success;
	}

	return success;
}

export async function getContextFromMessages(
	messages: ChatMessageStructure[],
	summary: string
): Promise<ChatMessageStructure[]> {
	messages = [...messages];

	const lastMessagesCount = 2;
	const similarityMessagesMaxTokenLimit = 1000;
	const similarityMessagesThreshold = 0.5;

	const queryMessage = messages.pop() as ChatMessageStructure;

	const lastMessages = messages.splice(-lastMessagesCount);

	const similarMessages = await embeddingHelper.getSimilarMessagesToQuery(
		messages,
		queryMessage.content,
		similarityMessagesMaxTokenLimit,
		similarityMessagesThreshold
	);

	const context: ChatMessageStructure[] = [];

	if (summary) context.push(templates.getUserMessageWithContent("Summary:\n" + summary));
	context.push(...similarMessages);
	context.push(...lastMessages);
	context.push(queryMessage);

	return context;
}

export function searchChats(chatMap: ChatDataMap, query: string): ChatDataMap {
	const lowerCaseQuery = query.toLowerCase();

	const filteredChats = Object.entries(chatMap).filter(([, chat]) => {
		const lowerCaseTitle = chat.title.toLowerCase();
		const lowerCaseSummary = chat.summary.toLowerCase();
		const lowerCaseTags = chat.tags.map((tag) => tag.toLowerCase());

		return (
			lowerCaseTitle.includes(lowerCaseQuery) ||
			lowerCaseSummary.includes(lowerCaseQuery) ||
			lowerCaseTags.includes(lowerCaseQuery)
		);
	});

	return Object.fromEntries(filteredChats);
}

async function isSummaryNeededForChat(chatID: string): Promise<boolean> {
	const currentSummary = get(chatDataMap)[chatID].summary;
	//const context = [...get(lastContextOfChat)[chatID], ...get(chatContentMap)[chatID].slice(-1)];
	const context = get(chatContentMap)[chatID].slice(-6);

	if (!currentSummary) return true;

	const similarity = await embeddingHelper.getSimilarityFromMessagesToQuery(
		context.slice(-2),
		currentSummary
	);

	return similarity < 0.8;
}
