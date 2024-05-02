import type OpenAI from "openai";

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

export type NewChatSettings = {
	model?: AssistantStructure;
	images?: File[];
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
	output: (query: string) => Promise<string>;
	outputLocation: "system" | "user";
};
