import type { MessageStructure, ChatContentMap } from "$lib/types";
import { chatContentMap, chatDataMap } from "$lib/stores";
import { get } from "svelte/store";

const exampleMessages: MessageStructure[] = [
	{
		id: "1",
		chat_id: "",
		content: "Message 1",
		created_at: new Date(),
		role: "user",
		model: ""
	},
	{
		id: "2",
		chat_id: "",
		content: "Message 2",
		created_at: new Date(),
		role: "assistant",
		model: "gpt-3.5-turbo"
	},
	{
		id: "3",
		chat_id: "",
		content: "Message 3",
		created_at: new Date(),
		role: "user",
		model: ""
	},
	{
		id: "4",
		chat_id: "",
		content: "Message 4",
		created_at: new Date(),
		role: "assistant",
		model: "gpt-3.5-turbo"
	}
];

export const load = async ({ params }) => {
	const chat_id = params.slug;
	let oldChatDataMap: ChatContentMap = {};

	if (chat_id in get(chatDataMap)) {
		if (!Object.keys(get(chatContentMap)).includes(chat_id)) {
			const chatData: MessageStructure[] = exampleMessages.map((message) => {
				return {
					...message,
					chat_id
				};
			});

			oldChatDataMap = {
				...get(chatContentMap),
				[chat_id]: chatData
			};
		} else {
			oldChatDataMap = get(chatContentMap);
		}
	}

	return {
		chat_id,
		chatDataMap: oldChatDataMap
	};
};
