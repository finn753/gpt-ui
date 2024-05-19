import { get } from "svelte/store";
import { tavilyApiKey } from "$lib/scripts/misc/stores";

export async function runTavilySearch(
	query: string
): Promise<{ results: { title: string; url: string; content: string }[] } | { error: string }> {
	const body: Record<string, unknown> = {
		query: query,
		api_key: get(tavilyApiKey)
	};

	const response = await fetch("https://api.tavily.com/search", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify(body)
	});

	const json = await response.json();
	if (!response.ok) {
		console.error("Request failed with status code " + response.status + ": " + json.error);

		return { error: "Request failed with status code " + response.status + ": " + json.error };
	}
	if (!Array.isArray(json.results)) {
		return { error: "Could not parse search results. Please try again" };
	}
	return {
		results: json.results.map((result: { title: string; url: string; content: string }) => ({
			...result
		}))
	};
}

export async function getWebsiteContent(url: string): Promise<string> {
	const response = await fetch(`https://r.jina.ai/${url}`);
	return await response.text();
}
