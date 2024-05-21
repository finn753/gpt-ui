import { writable } from "svelte/store";
import type {
	ChatContentMap,
	ChatDataMap,
	GenerationHistory,
	ChatMessageStructure,
	ModelType,
	NewChatSettings,
	MemoryElement,
	TagElement
} from "$lib/scripts/misc/types";
import type { ModelTemplate } from "$lib/scripts/misc/model-templates";

export const chatDataMap = writable<ChatDataMap>({});
export const chatContentMap = writable<ChatContentMap>({});
export const selectedChatID = writable<string | null>();
export const lastContextOfChat = writable<Record<string, ChatMessageStructure[]>>({});
export const lastLiveDataSourceOutputOfChat = writable<Record<string, Record<string, string>>>({});
export const newChatSettings = writable<NewChatSettings>({});
export const currentModelTemplate = writable<string>("");
export const generationHistory = writable<GenerationHistory>({ images: [], voice: [] });

export const currentTTSMessageID = writable<string | null>();

export const availableModels = writable<ModelType[]>([]);

export const openaiApiKey = writable<string | null>();
export const tavilyApiKey = writable<string | null>();
export const groqApiKey = writable<string | null>();
export const mistralApiKey = writable<string | null>();
export const anthropicApiKey = writable<string | null>();
export const perplexityApiKey = writable<string | null>();
export const geminiApiKey = writable<string | null>();

export const userTagMap = writable<Record<number, TagElement>>({});
export const customModelTemplates = writable<ModelTemplate[]>([]);

export const memoryLDS = writable<MemoryElement[]>([]);
