import type { LiveDataSource } from "$lib/scripts/misc/types";
import { getWebsiteContent, runTavilySearch } from "$lib/scripts/api-wrapper/browsing";
import type { MessageFormat } from "$lib/scripts/api-wrapper/ModelWrapper";

export const currentTimeSource: LiveDataSource = {
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

export const webSearchSource: LiveDataSource = {
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

export const websitePreviewSource: LiveDataSource = {
	name: "Link Preview",
	activation: async (query: string) => {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return urlRegex.test(query);
	},
	output: async (query: string) => {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const urls = query.match(urlRegex);
		const content = urls ? await Promise.all(urls.map((url) => getWebsiteContent(url))) : [];

		if (content.length === 0) return "";

		return "Website Content:\n´´´\n" + content.join("\n\n") + "\n´´´";
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

	const systemOutputs: string[] = [];
	const userOutputs: string[] = [];

	for (const source of sources) {
		if (await source.activation(queryMessage.content)) {
			const output = await source.output(queryMessage.content);

			if (source.outputLocation === "system") {
				systemOutputs.push(output);
			}

			if (source.outputLocation === "user") {
				userOutputs.push(output);
			}
		}

		systemMessage.content += "\n\n" + systemOutputs.join("\n\n");
		queryMessage.content += "\n\n" + userOutputs.join("\n\n");
	}

	return [systemMessage, ...messages, queryMessage];
}
