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

	chatDataMap.update((curr) => {
		delete curr[newChatID];
		return { [newChatID]: emptyChat, ...curr };
	});

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
	chatContentMap.update((curr) => {
		return {
			...curr,
			[chatID]: [...(curr[chatID] || []), message]
		};
	});

	chatDataMap.update((curr) => {
		const temp = { ...curr[chatID], updated_at: new Date(Date.now()) };
		delete curr[chatID];
		return { [chatID]: temp, ...curr };
	});

	await database.insertMessage(chatID, message);
}

export async function changeTitle(chatID: string, title: string) {
	const success = await database.changeTitle(chatID, title);

	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				title
			}
		};
	});
}

export async function changeAssistantData(chatID: string, assistantData: AssistantStructure) {
	const success = await database.changeAssistantData(chatID, assistantData);

	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				model: assistantData
			}
		};
	});
}

export async function changeTags(chatID: string, tags: string[]) {
	const success = await database.changeTags(chatID, tags);

	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				tags
			}
		};
	});
}
