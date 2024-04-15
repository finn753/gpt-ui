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

export type MessageStructure = {
	content: string;
	role: "user" | "assistant" | "tool";
	model: string;
	created_at: Date;
	pinned?: boolean; // TODO - Include this in the type
	failed?: boolean;
};

export type ChatDataMap = Record<string, ChatStructure>;
export type ChatContentMap = Record<string, MessageStructure[]>;
export type GenerationHistory = { images: OpenAI.Images.Image[]; voice: string[] };
