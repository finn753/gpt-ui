import type { ChatCompletionTool } from "openai/resources/chat/completions";

export type llmTool = { input: ChatCompletionTool; function: (args: object) => string };
export type llmToolMap = Record<string, llmTool>;

export const getCurrentTime: llmTool = {
	input: {
		function: {
			name: "getCurrentTime"
		},
		type: "function"
	},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function: () => {
		return new Date().toLocaleTimeString();
	}
};
