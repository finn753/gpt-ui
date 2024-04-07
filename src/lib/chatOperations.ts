import { database } from "$lib/database";
import type { AssistantStructure, ChatStructure, MessageStructure } from "$lib/types";
import { chatContentMap, chatDataMap } from "$lib/stores";

export async function createNewChat() {
	const newChatID = await database.createNewChat();

	if (!newChatID) return;

	const emptyChat: ChatStructure = {
		title: "",
		tags: [],
		summary: "",
		model: {} as AssistantStructure,
		created_at: new Date(),
		updated_at: new Date()
	};

	updateChatDataMap(newChatID, emptyChat);
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

export async function sendMessage(message: MessageStructure, chatID: string) {
	updateChatContentMap(chatID, message);

	const temp = { updated_at: new Date(Date.now()) };
	updateChatDataMap(chatID, temp);

	await database.insertMessage(chatID, message);
	moveChatToTopOfDataMap(chatID);
}

export async function changeTitle(chatID: string, title: string) {
	const success = await database.changeTitle(chatID, title);

	if (!success) return;

	updateChatDataMap(chatID, { title });
}

export async function changeSummary(chatID: string, summary: string) {
	const success = await database.saveSummary(chatID, summary);
	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				summary
			}
		};
	});
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
