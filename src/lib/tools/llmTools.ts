import type {
	ChatCompletionMessageParam,
	ChatCompletionTool
} from "openai/resources/chat/completions";
import OpenAI from "openai";
import * as errorHandler from "$lib/errorHandler";
import { runTavilySearch } from "$lib/tools/tavily";
import type { ModelFunction } from "$lib/ModelWrapper";

export type llmTool<T extends Record<string, unknown> = Record<string, unknown>> = {
	definition: ChatCompletionTool;
	call: (args: T) => Promise<string>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type llmToolMap = Record<string, llmTool<any>>;

export function getToolSystemTemplate(functions: Record<string, ModelFunction>) {
	return `You have access to the following tools:
	${JSON.stringify(Object.values(functions).map((fn) => fn.definition))}
	You must always select one of the above tools and respond with only a JSON object matching the following schema:
	{
		"tool": <name of the selected tool>,
		"tool_input": <parameters for the selected tool, matching the tool's JSON schema. Do not include anything new>
	}`;
}

export const conversationalResponse: ModelFunction = {
	definition: {
		name: "conversationalResponse",
		description:
			"Trigger conversational response if no other tools should be called for a given query. No input required",
		parameters: {
			type: "object",
			properties: {
				triggerResponse: {
					type: "boolean",
					description: "Whether to trigger the conversational response or not"
				}
			},
			required: ["triggerResponse"]
		}
	},
	call: async () => {
		return "";
	}
};

export const getTavilySearchResults: llmTool<{ query: string }> = {
	definition: {
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
	call: async (args: { query: string }) => {
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
			const fn = tools[functionName].call;
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
