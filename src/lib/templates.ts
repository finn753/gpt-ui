import type { MessageStructure } from "$lib/types";

export function getAssistantResponseMessageFromModel(model: string): MessageStructure {
	return {
		chat_id: "",
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
