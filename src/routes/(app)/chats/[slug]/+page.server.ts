import type { OldChatData, OldChatDataMap, ChatStructure, MessageStructure } from "$lib/types";
import { chatDataMap, chatList, chatsData } from "$lib/stores";
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
	let oldChatDataMap: OldChatDataMap = {};

	if (chat_id in get(chatDataMap)) {
		if (!Object.keys(get(chatsData)).includes(chat_id)) {
			const chatData: OldChatData = <ChatStructure & { messages: MessageStructure[] }>{
				...get(chatList).find((chat) => chat.id === chat_id),
				messages: exampleMessages.map((message) => {
					return {
						...message,
						chat_id
					};
				})
			};

			oldChatDataMap = {
				...get(chatsData),
				[chat_id]: chatData
			};
		} else {
			oldChatDataMap = get(chatsData);
		}
	}

	return {
		chat_id,
		chatDataMap: oldChatDataMap
	};
};
