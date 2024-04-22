import type {
	ChatCompletionMessageParam,
	ChatCompletionTool
} from "openai/resources/chat/completions";
import OpenAI from "openai";
import * as errorHandler from "$lib/errorHandler";
import { runTavilySearch } from "$lib/tools/tavily";

export type llmTool<T extends Record<string, unknown> = Record<string, unknown>> = {
	input: ChatCompletionTool;
	function: (args: T) => Promise<string>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type llmToolMap = Record<string, llmTool<any>>;

export const getTavilySearchResults: llmTool<{ query: string }> = {
	input: {
		function: {
			name: "getTavilySearchResults",
			description:
				"A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query.",
			parameters: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "The search query to use"
					}
				},
				required: ["query"]
			}
		},
		type: "function"
	},
	function: async (args: { query: string }) => {
		return await runTavilySearch(args.query);
	}
};

export async function executeToolCalls(
	toolCalls: OpenAI.ChatCompletionMessageToolCall[],
	tools: llmToolMap
) {
	const context: ChatCompletionMessageParam[] = [];

	for (const toolCall of toolCalls) {
		const functionName = toolCall.function?.name;
		const functionArgs = toolCall.function?.arguments;

		if (!functionName) continue;

		try {
			const fn = tools[functionName].function;
			const result = await fn(JSON.parse(functionArgs || "{}"));

			context.push({
				tool_call_id: toolCall.id as string,
				role: "tool",
				content: result
			});
		} catch (e: unknown) {
			errorHandler.handleError("Failed to execute tool", e);
		}
	}
	return context;
}
