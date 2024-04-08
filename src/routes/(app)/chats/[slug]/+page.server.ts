import type { ChatContentMap, MessageStructure } from "$lib/types";
import { chatContentMap } from "$lib/stores";
import { get } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";

export const load = async ({ params, locals }) => {
	const chatID = params.slug;
	const chatDataMap: ChatContentMap = {
		...get(chatContentMap),
		...{ [chatID]: await fetchChatMessages(chatID, locals.supabase) }
	};

	return {
		chatID: chatID,
		chatDataMap
	};
};

async function fetchChatMessages(
	chatID: string,
	supabase: SupabaseClient
): Promise<MessageStructure[]> {
	const { data } = await supabase
		.from("Messages")
		.select("*")
		.eq("chat_id", chatID)
		.order("created_at");
	return data?.reduce((acc, message) => {
		acc.push({
			id: message.id,
			chat_id: message.chat_id,
			content: message.content,
			created_at: new Date(message.created_at),
			role: message.role,
			model: message.model
		});
		return acc;
	}, []);
}
