import type { OldChatData, OldChatDataMap, ChatStructure, MessageStructure } from "$lib/types";
import { chatList, chatsData } from "$lib/stores";
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
	let chatDataMap: OldChatDataMap = {};

	if (get(chatList).find((chat) => chat.id === chat_id)) {
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

			chatDataMap = {
				...get(chatsData),
				[chat_id]: chatData
			};
		} else {
			chatDataMap = get(chatsData);
		}
	}

	return {
		chat_id,
		chatDataMap
	};
};
