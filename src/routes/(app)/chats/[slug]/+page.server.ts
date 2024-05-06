import type { ChatContentMap, ChatMessageStructure } from "$lib/scripts/misc/types";
import { chatContentMap } from "$lib/scripts/misc/stores";
import { get } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";

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
): Promise<ChatMessageStructure[]> {
	const { data } = await supabase
		.from("Messages")
		.select("*")
		.eq("chat_id", chatID)
		.order("created_at");

	if (!data) {
		throw redirect(303, "/chats");
	}

	return data?.reduce((acc, message) => {
		acc.push({
			id: message.id,
			chat_id: message.chat_id,
			content: message.content,
			created_at: new Date(message.created_at),
			role: message.role,
			model: message.model,
			tokens: message.tokens,
			attachments: message.attachments
		});
		return acc;
	}, []);
}
