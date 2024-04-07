import type { MessageStructure } from "$lib/types";
import { EmbeddingIndex, getEmbedding } from "client-vector-search";
import { encode } from "gpt-tokenizer";

export async function getContextFromMessages(
	messages: MessageStructure[]
): Promise<MessageStructure[]> {
	messages = [...messages];
	const queryMessage = messages.pop() as MessageStructure;
	const query = queryMessage?.content || "";

	const embeddedQuery = await getEmbedding(query);

	const embeddingIndexOfMessages = await getEmbeddingIndexOfMessages(messages);

	const messagesOrderedBySimilarity = await embeddingIndexOfMessages.search(embeddedQuery, {
		topK: embeddingIndexOfMessages.size()
	});

	const maxTokenLimit = 1000;
	let tokenCount = 0;

	const filteredOrderedMessages = messagesOrderedBySimilarity
		.filter((message) => {
			tokenCount += encode(message.object.message.content).length;
			return tokenCount <= maxTokenLimit;
		})
		.sort((a, b) => a.object.index - b.object.index);

	const context = filteredOrderedMessages.map((result) => result.object.message);
	context.push(queryMessage);

	return context;
}

async function getEmbeddingIndexOfMessages(messages: MessageStructure[]) {
	const embeddedContextPromise = messages.map(async (message, index) => {
		return {
			index,
			message,
			embedding: await getEmbedding(message.content)
		};
	});
	const embeddedContext = await Promise.all(embeddedContextPromise);
	return new EmbeddingIndex(embeddedContext);
}
