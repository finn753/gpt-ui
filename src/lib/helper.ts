import {
	chatContentMap,
	chatDataMap,
	lastContextOfChat,
	openaiApiKey,
	selectedChatID
} from "$lib/stores";
import { get } from "svelte/store";
import type { AssistantStructure, ChatStructure, MessageStructure } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "svelte-sonner";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getEmbedding, EmbeddingIndex } from "client-vector-search";
import { encode } from "gpt-tokenizer";

export async function createNewChat(supabase: SupabaseClient) {
	const emptyChat: ChatStructure = {
		title: "",
		tags: [],
		summary: "",
		model: {} as AssistantStructure,
		created_at: new Date(),
		updated_at: new Date()
	};

	const { error, data } = await supabase
		.from("Chats")
		.insert({ title: "", summary: "" })
		.select()
		.single();

	if (error) {
		toast.error("Failed to create new chat");
		console.error("Failed to create new chat", error);
		return;
	}

	const newChatID = data.id;

	chatDataMap.update((curr) => {
		delete curr[newChatID];
		return { [newChatID]: emptyChat, ...curr };
	});

	return newChatID;
}

export async function deleteChat(chatID: string, supabase: SupabaseClient) {
	const { error } = await supabase.from("Chats").delete().match({ id: chatID });

	if (error) {
		toast.error("Failed to delete chat");
		console.error("Failed to delete chat", error);
		return;
	}

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

export async function sendMessage(
	message: MessageStructure,
	chatID: string,
	supabase: SupabaseClient
) {
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

	const { error } = await supabase.from("Messages").insert({
		chat_id: chatID,
		content: message.content,
		role: message.role,
		model: message.model
	});

	if (error) {
		toast.error("Failed to send message");
		console.error("Failed to send message", error);
	}
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

export async function changeTitle(chatID: string, title: string, supabase: SupabaseClient) {
	const { error } = await supabase.from("Chats").update({ title }).match({ id: chatID });

	if (error) {
		toast.error("Failed to change title");
		console.error("Failed to change title", error);
		return;
	}

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

export async function createSummary(chatID: string, supabase: SupabaseClient) {
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

	const { error } = await supabase
		.from("Chats")
		.update({ summary: newSummary })
		.match({ id: chatID });

	if (error || !newSummary) {
		toast.error("Failed to create summary");
		console.error("Failed to create summary", error);
		return;
	}

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

export async function changeAssistantData(
	chatID: string,
	assistantData: AssistantStructure,
	supabase: SupabaseClient
) {
	const { error } = await supabase
		.from("Chats")
		.update({ model: assistantData })
		.match({ id: chatID });

	if (error) {
		toast.error("Failed to change assistant data");
		console.error("Failed to change assistant data", error);
		return;
	}

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

export async function changeTags(chatID: string, tags: string[], supabase: SupabaseClient) {
	const { error } = await supabase.from("Chats").update({ tags: { tags } }).match({ id: chatID });

	if (error) {
		toast.error("Failed to change tags");
		console.error("Failed to change tags", error);
		return;
	}

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
