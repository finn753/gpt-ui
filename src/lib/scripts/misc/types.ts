import type OpenAI from "openai";

export type AssistantStructure = {
	model: string;
	temperature: number;
	topP: number;
	systemMessage: string;
};

export type ChatStructure = {
	title: string;
	tags: number[];
	summary: string;
	model: AssistantStructure;
	tools: Record<string, object>;
	created_at: Date;
	updated_at: Date;
};

export type NewChatSettings = {
	model?: AssistantStructure;
	images?: File[];
	tools?: Record<string, object>;
	toolResults?: Record<string, string>;
};

export type ChatMessageStructure = {
	id?: string;
	content: string;
	role: "user" | "assistant" | "system";
	model: string;
	created_at: Date;
	pinned?: boolean;
	failed?: boolean;
	tokens?: { input: number; output: number };
	attachments?: object;
};

export type ChatDataMap = Record<string, ChatStructure>;
export type ChatContentMap = Record<string, ChatMessageStructure[]>;
export type GenerationHistory = { images: OpenAI.Images.Image[]; voice: string[] };

export type ModelType = {
	id: string;
	name: string;
	provider: string;
	vision: boolean;
};

export type LiveDataSource = {
	name: string;
	activation: (query: string) => Promise<boolean>;
	output: (query: string) => Promise<{ content: string; uiHint?: string }>;
	outputLocation: "system" | "user";
};

export type MemoryElement = {
	content: string;
};

export type TagElement = {
	id: number;
	name: string;
	hidden: boolean;
};

export type GeneratedToolData = {
	name: string;
	tsCode: string;
};
