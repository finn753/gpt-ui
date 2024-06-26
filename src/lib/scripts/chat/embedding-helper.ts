import type { ChatMessageStructure } from "$lib/scripts/misc/types";
import { EmbeddingIndex, getEmbedding } from "client-vector-search";

export async function getSimilarMessagesToQuery(
	messages: ChatMessageStructure[],
	query: string,
	maxTokenLimit = 1000,
	similarityThreshold = 0.9
): Promise<ChatMessageStructure[]> {
	messages = [...messages];

	const embeddedQuery = await getEmbedding(query);

	const embeddingIndexOfMessages = await getEmbeddingIndexOfMessages(messages);

	const messagesOrderedBySimilarity = await embeddingIndexOfMessages.search(embeddedQuery, {
		topK: embeddingIndexOfMessages.size()
	});

	let tokenCount = 0;

	const filteredOrderedMessages = messagesOrderedBySimilarity
		.filter((message) => {
			tokenCount += estimateTokenCount(message.object.message.content);
			return tokenCount <= maxTokenLimit && message.similarity >= similarityThreshold;
		})
		.sort((a, b) => a.object.index - b.object.index);

	return filteredOrderedMessages.map((result) => result.object.message);
}

export async function getSimilarityFromMessagesToQuery(
	messages: ChatMessageStructure[],
	query: string
) {
	const embeddedQuery = await getEmbedding(query);
	const embeddingIndexOfMessages = await getEmbeddingIndexOfMessages(messages);
	const messagesOrderedBySimilarity = await embeddingIndexOfMessages.search(embeddedQuery, {
		topK: embeddingIndexOfMessages.size()
	});

	const messageSimilarities = messagesOrderedBySimilarity.map((obj) => obj.similarity);

	const sum = messageSimilarities.reduce((a, b) => a + b, 0);
	return sum / messageSimilarities.length;
}

function estimateTokenCount(text: string) {
	return Math.ceil(text.length / 4);
}

async function getEmbeddingIndexOfMessages(messages: ChatMessageStructure[]) {
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
