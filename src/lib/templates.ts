import type { AssistantStructure, ChatStructure, MessageStructure } from "$lib/types";

export function getAssistantResponseMessageFromModel(model: string): MessageStructure {
	return {
		content: "",
		role: "assistant",
		model,
		created_at: new Date()
	};
}

export function getSingleTaskPromptMessages(system: string, user: string) {
	return [
		{
			role: "system",
			content: system
		},
		{
			role: "user",
			content: user
		}
	];
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
