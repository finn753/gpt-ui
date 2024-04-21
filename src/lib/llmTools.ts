import type { ChatCompletionTool } from "openai/resources/chat/completions";
import OpenAI from "openai";
import * as errorHandler from "$lib/errorHandler";
import type { ChatCompletionChunk } from "openai/resources/chat/completions";

type ToolCall = ChatCompletionChunk.Choice.Delta.ToolCall;

export type llmTool = { input: ChatCompletionTool; function: (args: object) => Promise<string> };
export type llmToolMap = Record<string, llmTool>;

export const getCurrentTime: llmTool = {
	input: {
		function: {
			name: "getCurrentTime"
		},
		type: "function"
	},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function: async () => {
		return new Date().toLocaleTimeString();
	}
};

export async function executeToolCalls(
	toolCalls: ToolCall[],
	tools: llmToolMap,
	messages: OpenAI.Chat.ChatCompletionMessageParam[]
) {
	for (const toolCall of toolCalls) {
		const functionName = toolCall.function?.name;
		const functionArgs = toolCall.function?.arguments;
		if (!functionName) continue;

		try {
			const fn = tools[functionName].function;
			const result = await fn(JSON.parse(functionArgs || "{}"));

			messages.push({
				tool_call_id: toolCall.id as string,
				role: "tool",
				content: result
			});
		} catch (e: unknown) {
			errorHandler.handleError("Failed to execute tool", e);
		}
	}
	return messages;
}
