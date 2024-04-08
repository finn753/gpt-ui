import { database } from "$lib/database";
import type { AssistantStructure, ChatStructure, MessageStructure } from "$lib/types";
import { chatContentMap, chatDataMap, lastContextOfChat } from "$lib/stores";
import * as templates from "$lib/templates";

export async function createNewChat() {
	const newChatID = await database.createNewChat();

	if (!newChatID) return;

	updateChatDataMap(newChatID, templates.getEmptyChat());
	moveChatToTopOfDataMap(newChatID);

	return newChatID;
}

export async function deleteChat(chatID: string) {
	const success = await database.deleteChat(chatID);

	if (!success) return;

	chatDataMap.update((curr) => {
		const newMap = { ...curr };
		delete newMap[chatID];
		return newMap;
	});

	chatContentMap.update((curr) => {
		const newMap = { ...curr };
		delete newMap[chatID];
		return newMap;
	});
}

export async function sendMessage(message: MessageStructure, chatID: string): Promise<boolean> {
	updateChatContentMap(chatID, message);

	const temp = { updated_at: new Date(Date.now()) };
	updateChatDataMap(chatID, temp);

	const success = await database.insertMessage(chatID, message);

	if (!success) return false;

	moveChatToTopOfDataMap(chatID);

	return true;
}

export async function changeTitle(chatID: string, title: string) {
	const success = await database.changeTitle(chatID, title);

	if (!success) return;

	updateChatDataMap(chatID, { title });
}

export async function changeSummary(chatID: string, summary: string) {
	const success = await database.saveSummary(chatID, summary);
	if (!success) return;

	updateChatDataMap(chatID, { summary });
}

export async function changeAssistantData(chatID: string, assistantData: AssistantStructure) {
	const success = await database.changeAssistantData(chatID, assistantData);

	if (!success) return;

	updateChatDataMap(chatID, { model: assistantData });
}

export async function changeTags(chatID: string, tags: string[]) {
	const success = await database.changeTags(chatID, tags);

	if (!success) return;

	updateChatDataMap(chatID, { tags });
}

export function updateLastContextOfChat(chatID: string, context: MessageStructure[]) {
	lastContextOfChat.update((curr) => {
		return {
			...curr,
			[chatID]: context
		};
	});
}

function updateChatDataMap(chatID: string, update: Partial<ChatStructure>) {
	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				...update
			}
		};
	});
}

function updateChatContentMap(chatID: string, message: MessageStructure) {
	chatContentMap.update((curr) => {
		return {
			...curr,
			[chatID]: [...(curr[chatID] || []), message]
		};
	});
}

function moveChatToTopOfDataMap(chatID: string) {
	chatDataMap.update((curr) => {
		const temp = curr[chatID];
		const newMap = { ...curr };
		delete newMap[chatID];
		return {
			[chatID]: temp,
			...newMap
		};
	});
}
