import {
	chatContentMap,
	chatDataMap,
	lastContextOfChat,
	openaiApiKey,
	selectedChatID
} from "$lib/stores";
import { get } from "svelte/store";
import type { AssistantStructure, ChatStructure, MessageStructure } from "$lib/types";
import { toast } from "svelte-sonner";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getEmbedding, EmbeddingIndex } from "client-vector-search";
import { encode } from "gpt-tokenizer";
import { database } from "$lib/database";

export async function createNewChat() {
	const newChatID = await database.createNewChat();

	if (!newChatID) return;

	const emptyChat: ChatStructure = {
		title: "",
		tags: [],
		summary: "",
		model: {} as AssistantStructure,
		created_at: new Date(),
		updated_at: new Date()
	};

	chatDataMap.update((curr) => {
		delete curr[newChatID];
		return { [newChatID]: emptyChat, ...curr };
	});

	return newChatID;
}

export async function deleteChat(chatID: string) {
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

export async function sendMessage(message: MessageStructure, chatID: string) {
	chatContentMap.update((curr) => {
		return {
			...curr,
			[chatID]: [...(curr[chatID] || []), message]
		};
	});

	chatDataMap.update((curr) => {
		const temp = { ...curr[chatID], updated_at: new Date(Date.now()) };
		delete curr[chatID];
		return { [chatID]: temp, ...curr };
	});

	await database.insertMessage(chatID, message);
}

export async function* generateResponse(
	context: MessageStructure[],
	model?: string,
	temperature?: number,
	top_p?: number,
	systemMessage?: string
): AsyncGenerator<MessageStructure | undefined> {
	model = model || "gpt-3.5-turbo";
	temperature = parseFloat(String(temperature)) || 0.5;
	top_p = parseFloat(String(top_p)) || 1;
	systemMessage = systemMessage || "";

	lastContextOfChat.update((curr) => {
		return {
			...curr,
			[get(selectedChatID) as string]: context
		};
	});

	let messages = context.map((message) => {
		return {
			role: message.role as string,
			content: message.content
		};
	});

	messages = [
		{
			role: "system",
			content: systemMessage
		},
		...messages
	];

	const responseMessage: MessageStructure = {
		chat_id: "",
		content: "",
		role: "assistant",
		model: model,
		created_at: new Date()
	};

	let openai: OpenAI;

	try {
		openai = new OpenAI({
			apiKey: get(openaiApiKey) || "",
			dangerouslyAllowBrowser: true
		});
	} catch (e: unknown) {
		toast.error("Failed to initialize OpenAI");
		console.error("Failed to initialize OpenAI", e);
		return;
	}

	try {
		const stream = await openai.chat.completions.create({
			messages: messages as ChatCompletionMessageParam[],
			model,
			temperature,
			top_p,
			stream: true
		});

		responseMessage.content = "";

		for await (const part of stream) {
			responseMessage.content = responseMessage.content + (part.choices[0]?.delta?.content || "");
			yield responseMessage;
		}

		return responseMessage;
	} catch (e: unknown) {
		toast.error("Failed to generate response");
		console.error("Failed to generate response", e);
		return;
	}
}

export async function changeTitle(chatID: string, title: string) {
	const success = await database.changeTitle(chatID, title);

	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				title
			}
		};
	});
}

export async function generateTitle(context: MessageStructure[]) {
	const messages = [
		{
			role: "system",
			content:
				"You're an AI that generates titles for chats \n Keep them short, summarise the chat, don't be too specific \n" +
				"Don't enumerate the points, don't use the word 'chat' in the title \n" +
				"SUMMARIZE the chat in a few words"
		},
		{
			role: "user",
			content: JSON.stringify(context)
		}
	];

	let openai: OpenAI;

	try {
		openai = new OpenAI({
			apiKey: get(openaiApiKey) || "",
			dangerouslyAllowBrowser: true
		});
	} catch (e: unknown) {
		toast.error("Failed to initialize OpenAI");
		console.error("Failed to initialize OpenAI", e);
		return;
	}

	const completion = await openai.chat.completions.create({
		messages: messages as ChatCompletionMessageParam[],
		model: "gpt-3.5-turbo"
	});

	return completion.choices[0].message.content?.replace(/"/g, "");
}

export async function createSummary(chatID: string) {
	const currentSummary = get(chatDataMap)[chatID].summary;
	const newMessages = get(chatContentMap)[chatID].slice(-6);

	const messages = [
		{
			role: "system",
			content:
				"You're an AI that generates summaries for chats \n Keep them short, summarise the chat, don't be too specific \n" +
				"Don't enumerate the points, don't use the word 'chat' in the summary \n" +
				"DO NOT say 'The user said', 'The assistant said', etc. \n" +
				"SUMMARIZE the chat in a few words, one sentence maximum \n"
		},
		{
			role: "user",
			content:
				"Current summary: \n " +
				currentSummary +
				"\n\n" +
				"Messages: \n" +
				JSON.stringify(newMessages)
		}
	];

	let openai: OpenAI;

	try {
		openai = new OpenAI({
			apiKey: get(openaiApiKey) || "",
			dangerouslyAllowBrowser: true
		});
	} catch (e: unknown) {
		toast.error("Failed to initialize OpenAI");
		console.error("Failed to initialize OpenAI", e);
		return;
	}

	const newSummary = await openai.chat.completions
		.create({
			messages: messages as ChatCompletionMessageParam[],
			model: "gpt-3.5-turbo"
		})
		.then((res) => res.choices[0].message.content);

	if (!newSummary) return;

	const success = await database.saveSummary(chatID, newSummary);
	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				summary: newSummary
			}
		};
	});
}

export async function changeAssistantData(chatID: string, assistantData: AssistantStructure) {
	const success = await database.changeAssistantData(chatID, assistantData);

	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				model: assistantData
			}
		};
	});
}

export async function changeTags(chatID: string, tags: string[]) {
	const success = await database.changeTags(chatID, tags);

	if (!success) return;

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chatID]: {
				...curr[chatID],
				tags
			}
		};
	});
}

export async function getContextFromMessages(
	messages: MessageStructure[]
): Promise<MessageStructure[]> {
	messages = [...messages];
	let context: MessageStructure[] = [];
	const queryMessage = messages.pop() as MessageStructure;
	const query = queryMessage?.content || "";

	const embeddedContextPromise = messages.map(async (message, index) => {
		return {
			index,
			message,
			embedding: await getEmbedding(message.content)
		};
	});
	const embeddedContext = await Promise.all(embeddedContextPromise);
	const embeddedQuery = await getEmbedding(query);

	const index = new EmbeddingIndex(embeddedContext);

	const messagesOrderedBySimilarity = await index.search(embeddedQuery, {
		topK: index.size()
	});

	const maxTokenLimit = 1000;
	let tokenCount = 0;

	const filteredOrderedMessages = messagesOrderedBySimilarity
		.filter((message) => {
			tokenCount += encode(message.object.message.content).length;
			return tokenCount <= maxTokenLimit;
		})
		.sort((a, b) => a.object.index - b.object.index);

	context = filteredOrderedMessages.map((result) => result.object.message);
	context.push(queryMessage);

	return context;
}
