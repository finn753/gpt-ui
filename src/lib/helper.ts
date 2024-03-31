import { chatContentMap, chatDataMap, openaiApiKey } from "$lib/stores";
import { get, type Writable } from "svelte/store";
import type { ChatStructure, MessageStructure } from "$lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "svelte-sonner";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function createNewChat(supabase: SupabaseClient) {
	const emptyChat: ChatStructure = {
		title: "",
		tags: [],
		summary: "",
		model: "",
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

	chatDataMap.set({ ...get(chatDataMap), [newChatID]: emptyChat });

	return newChatID;
}

export async function sendMessage(
	message: MessageStructure,
	chat_id: string,
	supabase: SupabaseClient
) {
	chatContentMap.update((curr) => {
		return {
			...curr,
			[chat_id]: [...curr[chat_id], message]
		};
	});

	const { error } = await supabase.from("Messages").insert({
		chat_id: chat_id,
		content: message.content,
		role: message.role,
		model: message.model
	});

	if (error) {
		toast.error("Failed to send message");
		console.error("Failed to send message", error);
	}
}

export async function generateResponse(
	context: MessageStructure[],
	output: Writable<MessageStructure | null>
): Promise<MessageStructure | undefined> {
	const messages = context.map((message) => {
		return {
			role: message.role as string,
			content: message.content
		};
	});

	const responseMessage: MessageStructure = {
		chat_id: "",
		content: "",
		role: "assistant",
		model: "",
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
			model: "gpt-3.5-turbo",
			stream: true
		});

		responseMessage.content = "";

		for await (const part of stream) {
			responseMessage.content = responseMessage.content + (part.choices[0]?.delta?.content || "");
			output.set(responseMessage);
		}

		return responseMessage;
	} catch (e: unknown) {
		toast.error("Failed to generate response");
		console.error("Failed to generate response", e);
		return;
	}
}

export async function changeTitle(chat_id: string, title: string, supabase: SupabaseClient) {
	const { error } = await supabase.from("Chats").update({ title }).match({ id: chat_id });

	if (error) {
		toast.error("Failed to change title");
		console.error("Failed to change title", error);
		return;
	}

	chatDataMap.update((curr) => {
		return {
			...curr,
			[chat_id]: {
				...curr[chat_id],
				title
			}
		};
	});
}

export async function generateTitle(context: MessageStructure[]) {
	const messages = [
		{
			role: "system",
			content: "You're an AI that generates titles for chats. Keep them short"
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
