import database from "$lib/scripts/operations/database";
import type {
	AssistantStructure,
	ChatStructure,
	ChatMessageStructure
} from "$lib/scripts/misc/types";
import { chatContentMap, chatDataMap, lastContextOfChat } from "$lib/scripts/misc/stores";
import { get } from "svelte/store";

function getEmptyChat(): ChatStructure {
	return {
		title: "",
		tags: [],
		summary: "",
		model: {} as AssistantStructure,
		tools: {},
		created_at: new Date(),
		updated_at: new Date()
	};
}

class ChatOperations {
	public async createNewChat() {
		const newChatID = await database.createNewChat();

		if (!newChatID) return;

		this.updateChatDataMap(newChatID, getEmptyChat());
		this.moveChatToTopOfDataMap(newChatID);

		return newChatID;
	}

	public async deleteChat(chatID: string) {
		const success = await database.deleteChat(chatID);

		if (!success) return;

		chatDataMap.update((curr) => {
			const newMap = { ...curr };
			delete newMap[chatID];
			return newMap;
		});

		chatContentMap.update((curr) => {
			const newMap = { ...curr };
			delete newMap[chatID];
			return newMap;
		});
	}

	public async sendMessage(message: ChatMessageStructure, chatID: string): Promise<boolean> {
		this.updateChatContentMap(chatID, message);

		const temp = { updated_at: new Date(Date.now()) };
		this.updateChatDataMap(chatID, temp);

		const success = await database.insertMessage(chatID, message);

		this.moveChatToTopOfDataMap(chatID);

		if (!success) {
			const message = get(chatContentMap)[chatID].pop();

			if (message) {
				this.updateChatContentMap(chatID, { ...message, failed: true });
			}

			return false;
		} else {
			const message = get(chatContentMap)[chatID].pop();

			if (message) {
				this.updateChatContentMap(chatID, { ...message, id: success });
			}
		}

		return true;
	}

	public async retrySendMessage(message: ChatMessageStructure, chatID: string) {
		const success = await database.insertMessage(chatID, message);

		if (!success) return false;

		chatContentMap.update((curr) => {
			const chatMessages = curr;

			chatMessages[chatID] = chatMessages[chatID].map((msg) => {
				if (JSON.stringify(msg) === JSON.stringify(message)) {
					return { ...msg, failed: false };
				}
				return msg;
			});

			return chatMessages;
		});

		return true;
	}

	public async deleteMessage(messageId: string, chatID: string) {
		const success = await database.deleteMessage(messageId);

		if (!success) return;

		chatContentMap.update((curr) => {
			const chatMessages = curr;
			chatMessages[chatID] = chatMessages[chatID].filter((msg) => msg.id !== messageId);
			return chatMessages;
		});
	}

	public async changeTitle(chatID: string, title: string) {
		const success = await database.changeTitle(chatID, title);

		if (!success) return;

		this.updateChatDataMap(chatID, { title });
	}

	public async changeSummary(chatID: string, summary: string) {
		const success = await database.saveSummary(chatID, summary);
		if (!success) return;

		this.updateChatDataMap(chatID, { summary });
	}

	public async changeAssistantData(chatID: string, assistantData: AssistantStructure) {
		const success = await database.changeAssistantData(chatID, assistantData);

		if (!success) return;

		this.updateChatDataMap(chatID, { model: assistantData });
	}

	public async changeTags(chatID: string, tags: string[]) {
		const success = await database.changeChatTags(chatID, tags);

		if (!success) return;

		this.updateChatDataMap(chatID, { tags });
	}

	public async changeTools(chatID: string, tools: Record<string, object>) {
		const success = await database.changeTools(chatID, tools);

		if (!success) return;

		this.updateChatDataMap(chatID, { tools });
	}

	public updateLastContextOfChat(chatID: string, context: ChatMessageStructure[]) {
		lastContextOfChat.update((curr) => {
			return {
				...curr,
				[chatID]: context
			};
		});
	}

	private updateChatDataMap(chatID: string, update: Partial<ChatStructure>) {
		chatDataMap.update((curr) => {
			return {
				...curr,
				[chatID]: {
					...curr[chatID],
					...update
				}
			};
		});
	}

	private updateChatContentMap(chatID: string, message: ChatMessageStructure) {
		chatContentMap.update((curr) => {
			return {
				...curr,
				[chatID]: [...(curr[chatID] || []), message]
			};
		});
	}

	private moveChatToTopOfDataMap(chatID: string) {
		chatDataMap.update((curr) => {
			const temp = curr[chatID];
			const newMap = { ...curr };
			delete newMap[chatID];
			return {
				[chatID]: temp,
				...newMap
			};
		});
	}
}

export default new ChatOperations();
