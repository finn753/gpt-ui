import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssistantStructure, MessageStructure } from "$lib/types";
import { toast } from "svelte-sonner";

class Database {
	private _supabaseClient: SupabaseClient | null = null;

	set supabaseClient(client: SupabaseClient) {
		this._supabaseClient = client;
	}

	get supabaseClient(): SupabaseClient | null {
		return this._supabaseClient;
	}

	async createNewChat(): Promise<string | null> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return null;
		}

		const { error, data } = await this._supabaseClient
			.from("Chats")
			.insert({ title: "", summary: "" })
			.select()
			.single();

		if (error) {
			toast.error("Failed to create new chat");
			console.error("Failed to create new chat", error);
			return null;
		}

		return data.id;
	}

	async deleteChat(chatID: string): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient.from("Chats").delete().match({ id: chatID });

		if (error) {
			toast.error("Failed to delete chat");
			console.error("Failed to delete chat", error);
			return false;
		}

		return true;
	}

	async insertMessage(chatID: string, message: MessageStructure): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient.from("Messages").insert({
			chat_id: chatID,
			content: message.content,
			role: message.role,
			model: message.model
		});

		if (error) {
			toast.error("Failed to send message");
			console.error("Failed to send message", error);
			return false;
		}

		return true;
	}

	async changeTitle(chatID: string, title: string): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient
			.from("Chats")
			.update({ title })
			.match({ id: chatID });

		if (error) {
			toast.error("Failed to change title");
			console.error("Failed to change title", error);
			return false;
		}

		return true;
	}

	async saveSummary(chatID: string, summary: string): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient
			.from("Chats")
			.update({ summary })
			.match({ id: chatID });

		if (error) {
			toast.error("Failed to save summary");
			console.error("Failed to save summary", error);
			return false;
		}

		return true;
	}

	async changeTags(chatID: string, tags: string[]): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient
			.from("Chats")
			.update({ tags: { tags } })
			.match({ id: chatID });

		if (error) {
			toast.error("Failed to change tags");
			console.error("Failed to change tags", error);
			return false;
		}

		return true;
	}

	async changeAssistantData(chatID: string, assistantData: AssistantStructure): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient
			.from("Chats")
			.update({ model: assistantData })
			.match({ id: chatID });

		if (error) {
			toast.error("Failed to change assistant data");
			console.error("Failed to change assistant data", error);
			return false;
		}

		return true;
	}
}

export const database = new Database();
