import { chatContentMap, chatDataMap, selectedChatID, userTagMap } from "$lib/scripts/misc/stores";
import { get } from "svelte/store";
import chatOperations from "$lib/scripts/chat/chat-operations";
import type { ChatDataMap, ChatMessageStructure } from "$lib/scripts/misc/types";
import { generationHelper } from "$lib/scripts/chat/generation-helper";
import {
	getSimilarityFromMessagesToQuery,
	getSimilarMessagesToQuery
} from "$lib/scripts/chat/embedding-helper";

class ChatService {
	public async setGeneratedTitleForChat(chatID: string) {
		const messages = get(chatContentMap)[chatID] || [];
		const summary = get(chatDataMap)[chatID].summary;

		const newTitle = await generationHelper.generateTitle(summary || JSON.stringify(messages));
		if (newTitle) await chatOperations.changeTitle(chatID, newTitle);
	}

	public async updateSummaryForChat(chatID: string) {
		if (!(await this.isSummaryNeededForChat(chatID))) return;

		const currentSummary = get(chatDataMap)[chatID].summary;
		const newMessages = get(chatContentMap)[chatID].slice(-6);

		const newSummary = await generationHelper.generateSummary(currentSummary, newMessages);

		if (!newSummary) return;
		await chatOperations.changeSummary(chatID, newSummary);
	}

	public async sendUserMessage(
		chatID: string,
		message: string,
		attachments: object = {}
	): Promise<boolean> {
		if (message.trim() === "") return false;

		const newMessage: ChatMessageStructure = {
			content: message,
			role: "user",
			model: "",
			created_at: new Date(Date.now()),
			attachments
		};

		return await chatOperations.sendMessage(newMessage, chatID);
	}

	public async sendAssistantMessage(
		chatID: string,
		messages: ChatMessageStructure[]
	): Promise<boolean> {
		messages = [...messages];

		let success = true;

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];

			success = (await chatOperations.sendMessage(message, chatID)) && success;
		}

		return success;
	}

	public async getContextFromMessages(
		messages: ChatMessageStructure[],
		summary: string
	): Promise<ChatMessageStructure[]> {
		messages = [...messages];

		const lastMessagesCount = 2;
		const similarityMessagesMaxTokenLimit = 1000;
		const similarityMessagesThreshold = 0.5;

		const queryMessage = messages.pop() as ChatMessageStructure;

		const lastMessages = messages.splice(-lastMessagesCount);

		const similarMessages = await getSimilarMessagesToQuery(
			messages,
			queryMessage.content,
			similarityMessagesMaxTokenLimit,
			similarityMessagesThreshold
		);

		const context: ChatMessageStructure[] = [];

		if (summary) {
			context.push({
				content: "Summary:\n" + summary,
				role: "user",
				model: "",
				created_at: new Date()
			});
		}

		context.push(...similarMessages);
		context.push(...lastMessages);
		context.push(queryMessage);

		return context;
	}

	public searchChats(chatMap: ChatDataMap, query: string): ChatDataMap {
		const lowerCaseQuery = query.trim().toLowerCase();
		const lowerCaseQueryWords = lowerCaseQuery.split(" ");

		const filteredChats = Object.entries(chatMap).filter(([chatID, chat]) => {
			const lowerCaseTitle = chat.title.toLowerCase();
			const lowerCaseSummary = chat.summary.toLowerCase();

			const tagElements = chat.tags
				.filter((tagID) => tagID in get(userTagMap))
				.map((tagID) => get(userTagMap)[tagID]);
			const lowerCaseTags = tagElements.map((tagElement) => tagElement.name.toLowerCase());

			const currentChatID = get(selectedChatID);

			const isTagHidden = tagElements.some(
				(tagElement) =>
					tagElement.hidden && !lowerCaseQueryWords.includes(tagElement.name.toLowerCase())
			);

			return (
				(currentChatID === chatID || !isTagHidden) &&
				(lowerCaseTitle.includes(lowerCaseQuery) ||
					lowerCaseSummary.includes(lowerCaseQuery) ||
					lowerCaseQueryWords.some((queryWord) =>
						lowerCaseTags.some((tag) => tag.includes(queryWord))
					))
			);
		});

		return Object.fromEntries(filteredChats);
	}

	async isSummaryNeededForChat(chatID: string): Promise<boolean> {
		const currentSummary = get(chatDataMap)[chatID].summary;
		//const context = [...get(lastContextOfChat)[chatID], ...get(chatContentMap)[chatID].slice(-1)];
		const context = get(chatContentMap)[chatID].slice(-6);

		if (!currentSummary) return true;

		const similarity = await getSimilarityFromMessagesToQuery(context.slice(-2), currentSummary);

		return similarity < 0.8;
	}
}

export default new ChatService();
