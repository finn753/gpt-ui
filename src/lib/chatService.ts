import { chatContentMap, chatDataMap } from "$lib/stores";
import { get } from "svelte/store";
import * as chatOperations from "$lib/chatOperations";
import type { ChatDataMap, MessageStructure } from "$lib/types";
import * as generationHelper from "$lib/generationHelper";
import { generateTitle } from "$lib/generationHelper";
import * as embeddingHelper from "$lib/embeddingHelper";
import * as templates from "$lib/templates";

export async function setGeneratedTitleForChat(chatID: string) {
	const messages = get(chatContentMap)[chatID] || [];
	const newTitle = await generateTitle(messages);
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

	const newMessage: MessageStructure = {
		content: message,
		role: "user",
		model: "",
		created_at: new Date(Date.now())
	};

	return await chatOperations.sendMessage(newMessage, chatID);
}

export async function getContextFromMessages(
	messages: MessageStructure[],
	summary: string
): Promise<MessageStructure[]> {
	messages = [...messages];

	const lastMessagesCount = 2;
	const similarityMessagesMaxTokenLimit = 1000;
	const similarityMessagesThreshold = 0.5;

	const queryMessage = messages.pop() as MessageStructure;

	const lastMessages = messages.slice(-lastMessagesCount);

	const similarMessages = await embeddingHelper.getSimilarMessagesToQuery(
		messages,
		queryMessage.content,
		similarityMessagesMaxTokenLimit,
		similarityMessagesThreshold
	);

	const context: MessageStructure[] = [];

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
	return !get(chatDataMap)[chatID].summary;
}
