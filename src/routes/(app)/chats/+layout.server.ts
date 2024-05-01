import type { LayoutServerLoad } from "../../../../.svelte-kit/types/src/routes/$types";
import type { ChatDataMap } from "$lib/scripts/misc/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const load: LayoutServerLoad = async (event) => {
	const supabase = event.locals.supabase;

	const chatDataMap = fetchChatList(supabase);

	return { chatDataMap };
};

function fetchChatList(supabase: SupabaseClient): Promise<ChatDataMap> {
	return new Promise((resolve) => {
		supabase
			.from("Chats")
			.select("*")
			.order("updated_at", { ascending: false })
			.then((response) => {
				const formattedData = response.data?.reduce((acc, chat) => {
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

				resolve(formattedData);
			});
	});
}
