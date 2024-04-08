import { chatContentMap, chatDataMap } from "$lib/stores";
import { get } from "svelte/store";
import * as chatOperations from "$lib/chatOperations";
import type { MessageStructure } from "$lib/types";
import * as generationHelper from "$lib/generationHelper";
import { generateTitle } from "$lib/generationHelper";

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

async function isSummaryNeededForChat(chatID: string): Promise<boolean> {
	return !get(chatDataMap)[chatID].summary;
}
