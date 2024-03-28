import { writable } from "svelte/store";
import type { ChatContentMap, ChatDataMap, ChatStructure, OldChatDataMap } from "$lib/types";

/**
 * @deprecated Change of DataStructure
 */
export const chatList = writable<ChatStructure[]>([]);
/**
 * @deprecated Change of DataStructure
 */
export const chatsData = writable<OldChatDataMap>({});

export const chatDataMap = writable<ChatDataMap>({});
export const chatContentMap = writable<ChatContentMap>({});

export const selectedChatID = writable<string | null>();
