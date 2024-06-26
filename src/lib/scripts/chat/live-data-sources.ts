import type { LiveDataSource } from "$lib/scripts/misc/types";
import { getWebsiteContent, runTavilySearch } from "$lib/scripts/api-wrapper/browsing";
import type { MessageFormat } from "$lib/scripts/api-wrapper/ModelWrapper";
import {
	lastLiveDataSourceOutputOfChat,
	memoryLDS,
	newChatSettings,
	selectedChatID
} from "$lib/scripts/misc/stores";
import { get } from "svelte/store";

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
		const time = `${hours}:${minutes}:${seconds}`;

		const day = date.getDate();
		const month = date.toLocaleString("en", { month: "long" });
		const year = date.getFullYear();
		const dateStr = `${day}/${month}/${year}`;

		return {
			content: `Current time: ${time}\nCurrent date: ${dateStr}`,
			uiHint: `${time} - ${dateStr}`
		};
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

		if ("error" in result) {
			return { content: "An error occurred while searching the web", uiHint: result.error };
		}

		const resultMarkdown: string = result.results
			.map((r) => `**[${r.title}](${r.url})**\n${r.content}`)
			.join("\n\n");

		const resultDomains = result.results.map((r) => new URL(r.url).hostname);

		return {
			content: "This is the result of your web search:\n´´´\n" + resultMarkdown + "\n´´´",
			uiHint: "Search results from " + resultDomains.join(", ")
		};
	},
	outputLocation: "system"
};

export const websitePreviewSource: LiveDataSource = {
	name: "Link Preview",
	activation: async (query: string) => {
		const urlRegex = /(https?:\/\/\S+)/g;
		return urlRegex.test(query);
	},
	output: async (query: string) => {
		const urlRegex = /(https?:\/\/\S+)/g;
		const urls = query.match(urlRegex);
		const content = urls ? await Promise.all(urls.map((url) => getWebsiteContent(url))) : [];

		if (content.length === 0) return { content: "" };

		return {
			content: "Website Content:\n´´´\n" + content.join("\n\n") + "\n´´´",
			uiHint: `Visited ${content.length} links`
		};
	},
	outputLocation: "user"
};

export const memorySource: LiveDataSource = {
	name: "Memory",
	activation: async (query: string) => {
		return !!query;
	},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	output: async (query: string) => {
		const memories = get(memoryLDS).map((m) => m.content);

		return {
			content: "Additional Information:\n´´´\n- " + memories.join("\n- ") + "\n´´´",
			uiHint: "Used memories: " + (memories.length || "None")
		};
	},
	outputLocation: "system"
};

export const liveDataSourceMap: Record<string, LiveDataSource> = {
	"current-time": currentTimeSource,
	"web-search": webSearchSource,
	"link-preview": websitePreviewSource,
	memory: memorySource
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
	const uiHints: Record<string, string> = {};

	for (const source of sources) {
		if (await source.activation(queryMessage.content)) {
			const output = await source.output(queryMessage.content);

			uiHints[source.name] = output.uiHint || "Used";

			if (source.outputLocation === "system") {
				systemOutputs.push(output.content);
			}

			if (source.outputLocation === "user") {
				userOutputs.push(output.content);
			}
		}

		systemMessage.content += "\n\n" + systemOutputs.join("\n\n");
		queryMessage.content += "\n\n" + userOutputs.join("\n\n");

		const currentChatID = get(selectedChatID);

		if (currentChatID) {
			lastLiveDataSourceOutputOfChat.update((prev) => {
				prev[currentChatID] = uiHints;
				return prev;
			});
		} else {
			newChatSettings.update((prev) => {
				prev.toolResults = uiHints;
				return prev;
			});
		}
	}

	return [systemMessage, ...messages, queryMessage];
}
