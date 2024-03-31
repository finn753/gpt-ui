import { chatContentMap, chatDataMap } from "$lib/stores";
import { get } from "svelte/store";
import type { ChatStructure, MessageStructure } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "svelte-sonner";

export async function createNewChat(supabase: SupabaseClient) {
	const emptyChat: ChatStructure = {
		title: "",
		tags: [],
		summary: "",
		model: "",
		created_at: new Date(),
		updated_at: new Date()
	};

	const { error, data } = await supabase
		.from("Chats")
		.insert({ title: "", summary: "" })
		.select()
		.single();

	if (error) {
		toast.error("Failed to create new chat");
		console.error("Failed to create new chat", error);
		return;
	}

	const newChatID = data.id;

	chatDataMap.set({ ...get(chatDataMap), [newChatID]: emptyChat });

	return newChatID;
}

export async function sendMessage(
	message: MessageStructure,
	chat_id: string,
	supabase: SupabaseClient
) {
	chatContentMap.update((curr) => {
		return {
			...curr,
			[chat_id]: [...curr[chat_id], message]
		};
	});

	const { error } = await supabase.from("Messages").insert({
		chat_id: chat_id,
		content: message.content,
		role: message.role,
		model: message.model
	});

	if (error) {
		toast.error("Failed to send message");
		console.error("Failed to send message", error);
	}
}
