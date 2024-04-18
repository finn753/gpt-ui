import type { AssistantStructure, ChatStructure, MessageStructure } from "$lib/types";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";

export function getAssistantResponseMessageFromModel(model: string): MessageStructure {
	return {
		content: "",
		role: "assistant",
		model,
		created_at: new Date()
	};
}

export function getSingleTaskPromptMessages(system: string, user: string): BaseLanguageModelInput {
	return [
		["system", system],
		["user", user]
	];
}

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
