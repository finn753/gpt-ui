import type { LayoutServerLoad } from "../../../../.svelte-kit/types/src/routes/$types";
import type { ChatDataMap } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const load: LayoutServerLoad = async (event) => {
	const supabase = event.locals.supabase;

	const chatDataMap = await fetchChatList(supabase);

	return { chatDataMap };
};

async function fetchChatList(supabase: SupabaseClient): Promise<ChatDataMap> {
	const response = await supabase
		.from("Chats")
		.select("*")
		.order("updated_at", { ascending: false });

	return response.data?.reduce((acc, chat) => {
		acc[chat.id] = {
			title: chat.title,
			tags: chat.tags && Object.keys(chat.tags).includes("tags") ? chat.tags["tags"] : [],
			summary: chat.summary,
			model: chat.model,
			created_at: new Date(chat.created_at),
			updated_at: new Date(chat.updated_at)
		};

		return acc;
	}, {});
}
