import { writable } from "svelte/store";
import type {
	ChatContentMap,
	ChatDataMap,
	GenerationHistory,
	ChatMessageStructure,
	ModelType,
	NewChatSettings
} from "$lib/scripts/misc/types";

export const chatDataMap = writable<ChatDataMap>({});
export const chatContentMap = writable<ChatContentMap>({});
export const selectedChatID = writable<string | null>();
export const lastContextOfChat = writable<Record<string, ChatMessageStructure[]>>({});
export const newChatSettings = writable<NewChatSettings>({});
export const generationHistory = writable<GenerationHistory>({ images: [], voice: [] });

export const currentTTSMessageID = writable<string | null>();

export const availableModels = writable<ModelType[]>([]);

export const openaiApiKey = writable<string | null>();
export const tavilyApiKey = writable<string | null>();
