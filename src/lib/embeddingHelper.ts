import type { MessageStructure } from "$lib/types";
import { EmbeddingIndex, getEmbedding } from "client-vector-search";
import { encode } from "gpt-tokenizer";

export async function getSimilarMessagesToQuery(
	messages: MessageStructure[],
	query: string,
	maxTokenLimit = 1000,
	similarityThreshold = 0.9
): Promise<MessageStructure[]> {
	messages = [...messages];

	const embeddedQuery = await getEmbedding(query);

	const embeddingIndexOfMessages = await getEmbeddingIndexOfMessages(messages);

	const messagesOrderedBySimilarity = await embeddingIndexOfMessages.search(embeddedQuery, {
		topK: embeddingIndexOfMessages.size()
	});

	let tokenCount = 0;

	const filteredOrderedMessages = messagesOrderedBySimilarity
		.filter((message) => {
			tokenCount += encode(message.object.message.content).length;
			return tokenCount <= maxTokenLimit && message.similarity >= similarityThreshold;
		})
		.sort((a, b) => a.object.index - b.object.index);

	return filteredOrderedMessages.map((result) => result.object.message);
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
