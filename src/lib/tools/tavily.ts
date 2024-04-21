const maxResults = 5;

export async function runTavilySearch(query: string): Promise<string> {
	const body: Record<string, unknown> = {
		query: query,
		max_results: maxResults,
		api_key: ""
	};

	const response = await fetch("https://api.tavily.com/search", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify({ ...body })
	});

	const json = await response.json();
	if (!response.ok) {
		return "Request failed with status code ${response.status}: ${json.error}";
	}
	if (!Array.isArray(json.results)) {
		return "Could not parse Tavily results. Please try again";
	}
	return JSON.stringify(json.results);
}
