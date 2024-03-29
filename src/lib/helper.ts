import { chatDataMap } from "$lib/stores";
import { get } from "svelte/store";
import type { ChatStructure } from "$lib/types";

export async function createNewChat() {
	const emptyChat: ChatStructure = {
		title: "",
		tags: [],
		summary: "",
		model: "",
		created_at: new Date(),
		updated_at: new Date()
	};

	const newChatID =
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	chatDataMap.set({ ...get(chatDataMap), [newChatID]: emptyChat });

	return newChatID;
}
