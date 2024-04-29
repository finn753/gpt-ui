import type { LiveDataSource } from "$lib/types";
import { runTavilySearch } from "$lib/apiWrapper/tavily";
import type { MessageFormat } from "$lib/ModelWrapper";

export const currentTime: LiveDataSource = {
	name: "Current Time",
	activation: async (query: string) => {
		return !!query;
	},
	output: async () => {
		const date = new Date();
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		return `The current time is ${hours}:${minutes}:${seconds}`;
	},
	outputLocation: "system"
};

export const browsingTool: LiveDataSource = {
	name: "Web Search",
	activation: async (query: string) => {
		query = query.toLowerCase();

		// TODO: Replace with embeddings similarity check (and try to include multiple languages)
		const searchWords = ["browse", "search", "look", "find", "get"];
		const locationWords = ["web", "online", "internet"];

		const searchWord = searchWords.find((word) => query.includes(word));
		const locationWord = locationWords.find((word) => query.includes(word));

		return !!searchWord && !!locationWord;
	},
	output: async (query: string) => {
		const result = await runTavilySearch(query);

		return "Web search results:\n´´´\n" + result + "\n´´´";
	},
	outputLocation: "user"
};

export async function injectLiveDataSourceIntoMessages(
	messages: MessageFormat[],
	sources: LiveDataSource[]
) {
	if (messages.length === 0) return [];

	messages = [...messages];

	const systemMessageIndex = messages.findIndex((message) => message.role === "system");
	const systemMessage: MessageFormat =
		systemMessageIndex !== -1
			? messages.splice(systemMessageIndex, 1)[0]
			: { role: "system", content: "" };

	const queryMessage: MessageFormat = messages.pop() as MessageFormat;

	for (const source of sources) {
		if (await source.activation(queryMessage.content)) {
			const output = await source.output(queryMessage.content);

			if (source.outputLocation === "system") {
				systemMessage.content += "\n" + output;
			}

			if (source.outputLocation === "user") {
				queryMessage.content += "\n" + output;
			}
		}
	}

	return [systemMessage, ...messages, queryMessage];
}
