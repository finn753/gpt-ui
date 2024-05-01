import { writable } from "svelte/store";
import type {
	ChatContentMap,
	ChatDataMap,
	ChatStructure,
	GenerationHistory,
	ChatMessageStructure,
	ModelType
} from "$lib/scripts/misc/types";

export const chatDataMap = writable<ChatDataMap>({});
export const chatContentMap = writable<ChatContentMap>({});
export const selectedChatID = writable<string | null>();
export const lastContextOfChat = writable<Record<string, ChatMessageStructure[]>>({});
export const newChatSettings = writable<Partial<ChatStructure>>({});
export const generationHistory = writable<GenerationHistory>({ images: [], voice: [] });

export const availableModels = writable<ModelType[]>([]);

export const openaiApiKey = writable<string | null>();
export const tavilyApiKey = writable<string | null>();