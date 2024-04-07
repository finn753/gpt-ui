export type AssistantStructure = {
	model: string;
	temperature: number;
	topP: number;
	systemMessage: string;
};

export type ChatStructure = {
	title: string;
	tags: string[];
	summary: string;
	model: AssistantStructure;
	created_at: Date;
	updated_at: Date;
};

export type MessageStructure = {
	content: string;
	role: "user" | "assistant" | "tool";
	model: string;
	created_at: Date;
};

export type ChatDataMap = Record<string, ChatStructure>;
export type ChatContentMap = Record<string, MessageStructure[]>;
