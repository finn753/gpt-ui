import type { ChatContentMap, MessageStructure } from "$lib/types";
import { chatContentMap } from "$lib/stores";
import { get } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";

export const load = async ({ params, locals }) => {
	const chat_id = params.slug;
	const chatDataMap: ChatContentMap = {
		...get(chatContentMap),
		...{ [chat_id]: await fetchChatMessages(chat_id, locals.supabase) }
	};

	return {
		chat_id,
		chatDataMap
	};
};

async function fetchChatMessages(
	chat_id: string,
	supabase: SupabaseClient
): Promise<MessageStructure[]> {
	const { data } = await supabase.from("Messages").select("*").eq("chat_id", chat_id);
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
