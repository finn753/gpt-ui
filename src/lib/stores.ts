import { writable } from "svelte/store";
import type { ChatContentMap, ChatDataMap } from "$lib/types";

export const chatDataMap = writable<ChatDataMap>({});
export const chatContentMap = writable<ChatContentMap>({});
export const selectedChatID = writable<string | null>();
export const openaiApiKey = writable<string | null>();
