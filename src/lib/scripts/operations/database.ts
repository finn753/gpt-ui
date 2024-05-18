import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssistantStructure, ChatMessageStructure } from "$lib/scripts/misc/types";
import * as errorHandler from "$lib/scripts/operations/error-handler";
import { toast } from "svelte-sonner";
import type { ModelTemplate } from "$lib/scripts/misc/model-templates";

class Database {
	private _supabaseClient: SupabaseClient | null = null;

	set supabaseClient(client: SupabaseClient) {
		this._supabaseClient = client;
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
			errorHandler.handleError("Failed to create new chat", error);
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
			errorHandler.handleError("Failed to delete chat", error);
			return false;
		}

		return true;
	}

	async insertMessage(chatID: string, message: ChatMessageStructure): Promise<string | undefined> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return;
		}

		const { error, data } = await this._supabaseClient
			.from("Messages")
			.insert({
				chat_id: chatID,
				content: message.content,
				role: message.role,
				model: message.model,
				created_at: message.created_at,
				tokens: message.tokens
			})
			.select("id")
			.single();

		if (error) {
			errorHandler.handleError("Failed to send message", error);
			return;
		}

		return data.id as string;
	}

	async deleteMessage(messageID: string): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient.from("Messages").delete().match({ id: messageID });

		if (error) {
			errorHandler.handleError("Failed to delete message", error);
			return false;
		}

		return true;
	}

	async updateMessage(messageID: string, message: ChatMessageStructure): Promise<boolean> {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient
			.from("Messages")
			.update({
				content: message.content,
				role: message.role,
				model: message.model,
				created_at: message.created_at,
				tokens: message.tokens
			})
			.match({ id: messageID });

		if (error) {
			errorHandler.handleError("Failed to update message", error);
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
			errorHandler.handleError("Failed to change title", error);
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
			errorHandler.handleError("Failed to save summary", error);
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
			errorHandler.handleError("Failed to change tags", error);
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
			errorHandler.handleError("Failed to change assistant data", error);
			return false;
		}

		return true;
	}

	async changeApiKey(provider: string, value: string) {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const userId = await this._supabaseClient.auth.getUser().then((user) => user.data.user?.id);

		if (!userId) {
			toast.error("You need to be logged in to save your API key.");
			return false;
		}

		const response = await this._supabaseClient
			.from("Profiles")
			.update({ [provider]: value })
			.eq("id", userId);

		if (response.error) {
			toast.error(response.error.message);
			return false;
		}

		toast.success("API key saved");
		return true;
	}

	async changePassword(newPassword: string) {
		const response = await this._supabaseClient?.auth.updateUser({ password: newPassword });

		if (response?.error) {
			errorHandler.handleError("Failed to change password", response.error);
			return false;
		}

		return true;
	}

	async changeTools(chatID: string, tools: Record<string, object>) {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const { error } = await this._supabaseClient
			.from("Chats")
			.update({ tools })
			.match({ id: chatID });

		if (error) {
			errorHandler.handleError("Failed to change tools", error);
			return false;
		}

		return true;
	}

	async changeHiddenTags(hiddenTags: string[]) {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const userId = await this._supabaseClient.auth.getUser().then((user) => user.data.user?.id);

		if (!userId) {
			toast.error("You need to be logged in to save your hidden tags.");
			return false;
		}

		const response = await this._supabaseClient
			.from("Profiles")
			.update({ hidden_tags: hiddenTags })
			.eq("id", userId);

		if (response.error) {
			toast.error(response.error.message);
			return false;
		}

		toast.success("Hidden tags saved");
		return true;
	}

	async changeCustomModelTemplates(customModelTemplates: ModelTemplate[]) {
		if (!this._supabaseClient) {
			console.error("Supabase client is not initialized");
			return false;
		}

		const userId = await this._supabaseClient.auth.getUser().then((user) => user.data.user?.id);

		if (!userId) {
			toast.error("You need to be logged in to save your custom model templates.");
			return false;
		}

		const response = await this._supabaseClient
			.from("Profiles")
			.update({ custom_model_templates: customModelTemplates })
			.eq("id", userId);

		if (response.error) {
			toast.error(response.error.message);
			return false;
		}

		toast.success("Custom model templates saved");
		return true;
	}
}

export default new Database();
