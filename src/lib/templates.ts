import type { AssistantStructure, ChatStructure, MessageStructure } from "$lib/types";

export function getUserMessageWithContent(content: string): MessageStructure {
	return {
		content,
		role: "user",
		model: "",
		created_at: new Date()
	};
}

export function getEmptyChat(): ChatStructure {
	return {
		title: "",
		tags: [],
		summary: "",
		model: {} as AssistantStructure,
		created_at: new Date(),
		updated_at: new Date()
	};
}
