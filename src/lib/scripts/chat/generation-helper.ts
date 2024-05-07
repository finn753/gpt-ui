import type { ChatMessageStructure } from "$lib/scripts/misc/types";
import { get } from "svelte/store";
import { selectedChatID } from "$lib/scripts/misc/stores";
import * as errorHandler from "$lib/scripts/operations/error-handler";
import chatOperations from "$lib/scripts/chat/chat-operations";
import { type MessageFormat, ModelWrapper } from "$lib/scripts/api-wrapper/ModelWrapper";
import { liveDataSourceMap } from "$lib/scripts/chat/live-data-sources";
import modelManager from "$lib/scripts/chat/model-manager";
import { convertImageListToBase64 } from "$lib/scripts/chat/attachment-handler";

class GenerationHelper {
	public async generateTitle(context: string) {
		const systemPrompt =
			"You're an AI that generates titles for chats \n Keep them short, summarise the chat, don't be too specific \n" +
			"Don't enumerate the points, don't use the word 'chat' in the title \n" +
			"SUMMARIZE the chat in a few words";

		const model = new ModelWrapper(modelManager.getDefaultModelId());
		return model.prompt(context, systemPrompt);
	}

	public async generateSummary(currentSummary: string, newMessages: ChatMessageStructure[]) {
		const systemPrompt =
			"You're an AI that generates summaries for chats \n Keep them short, summarise the chat, don't be too specific \n" +
			"Don't enumerate the points, don't use the word 'chat' in the summary \n" +
			"DO NOT say 'The user said', 'The assistant said', etc. \n" +
			"SUMMARIZE the chat in a few words, one sentence maximum \n";

		const input =
			"Current summary: \n " +
			currentSummary +
			"\n\n" +
			"Messages: \n" +
			JSON.stringify(newMessages);

		const model = new ModelWrapper(modelManager.getDefaultModelId());
		return model.prompt(input, systemPrompt);
	}

	public async *generateResponse(
		context: ChatMessageStructure[],
		modelId: string,
		options?: { temperature?: number; top_p?: number },
		systemMessage?: string,
		imageAttachments: File[] = [],
		tools: Record<string, object> = {}
	): AsyncGenerator<ChatMessageStructure[] | undefined> {
		chatOperations.updateLastContextOfChat(get(selectedChatID) as string, context);

		const messages: MessageFormat[] = await this.chatMessagesToCompletionMessages(
			context,
			systemMessage,
			imageAttachments
		);

		let responseMessages: ChatMessageStructure[] = [];
		const liveDataSources = Object.keys(tools)
			.filter((key) => key in liveDataSourceMap)
			.map((key) => liveDataSourceMap[key]);

		try {
			const model = new ModelWrapper(modelId, options);
			model.liveDataSources = liveDataSources;
			const stream = model.streamToolAgentResponse(messages);
			if (!stream) throw new Error("Failed to generate response");

			for await (const part of stream) {
				responseMessages = part.map((message) => {
					return {
						content: message.content?.toString() || "",
						role: message.role,
						model: model.modelName,
						created_at: new Date(Date.now())
					};
				});
				yield responseMessages;
			}

			return responseMessages;
		} catch (e: unknown) {
			errorHandler.handleError("Failed to generate response", e);
			return;
		}
	}

	public async *continueResponse(
		context: ChatMessageStructure[],
		modelId: string,
		options?: { temperature?: number; top_p?: number },
		systemMessage?: string
	): AsyncGenerator<ChatMessageStructure[] | undefined> {
		const continuedMessage = context[context.length - 1];
		context.push({
			content: "continue",
			role: "user",
			model: modelId,
			created_at: new Date(Date.now())
		});

		if (!continuedMessage || continuedMessage.role !== "assistant") return;

		const continuedStream = this.generateResponse(context, modelId, options, systemMessage);

		for await (const part of continuedStream) {
			if (!part) continue;

			yield part;
		}
	}

	async chatMessagesToCompletionMessages(
		chatMessages: ChatMessageStructure[],
		systemMessage: string = "",
		imageAttachments?: File[]
	): Promise<MessageFormat[]> {
		if (chatMessages.length === 0) return [];

		const messages: MessageFormat[] = chatMessages.map((message) => {
			if (message.role !== "user" && message.role !== "system") {
				message.role = "assistant";
			}

			return {
				role: message.role,
				content: message.content
			};
		});

		messages[messages.length - 1].images = await convertImageListToBase64(imageAttachments);

		return [
			{
				role: "system",
				content: systemMessage
			},
			...messages
		];
	}
}

export const generationHelper = new GenerationHelper();
