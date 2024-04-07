import type { MessageStructure } from "$lib/types";
import { EmbeddingIndex, getEmbedding } from "client-vector-search";
import { encode } from "gpt-tokenizer";

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
