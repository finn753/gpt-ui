import { writable } from "svelte/store";
import type { ChatStructure, ChatDataMap } from "$lib/types";

export const chatList = writable<ChatStructure[]>([]);
export const chatsData = writable<ChatDataMap>({});
export const testStore = writable<string>("Hello World");
