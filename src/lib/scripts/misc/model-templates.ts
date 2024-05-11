export type ModelTemplate = {
	name: string;
	description: string;
	settings: {
		modelIDs: string[];
		systemMessage: string;
		temperature: number;
		topP: number;
	};
	tools: Record<string, object>;
};

const casualChatTemplate: ModelTemplate = {
	name: "Casual Chat",
	description: "A casual, all purpose chat model",
	settings: {
		modelIDs: ["openai:gpt-3.5-turbo"],
		systemMessage: "You are a helpful assistant",
		temperature: 0.5,
		topP: 0.5
	},
	tools: { "current-time": {}, "web-search": {}, "link-preview": {} }
};

const creativeWritingTemplate: ModelTemplate = {
	name: "Creative Writing Coach",
	description: "Improve writing skills and receive feedback",
	settings: {
		modelIDs: ["openai:gpt-4-turbo"],
		systemMessage:
			"You are a creative writing coach, guiding users to improve their storytelling skills and express their ideas effectively. Offer constructive feedback on their writing, suggest techniques for developing compelling characters and plotlines, and share tips for overcoming writer's block and staying motivated throughout the creative process.",
		temperature: 0.7,
		topP: 0.8
	},
	tools: {}
};

const codeGenerationTemplate: ModelTemplate = {
	name: "Code Generation",
	description: "Precise and efficient programming solutions",
	settings: {
		modelIDs: ["openai:gpt-4-turbo"],
		systemMessage:
			"You are an AI programming assistant. Follow the user's requirements carefully and to the letter. First, think step-by-step and describe your plan for what to build in pseudocode, written out in great detail. Then, output the code in a single code block. Minimize any other prose",
		temperature: 0.1,
		topP: 0.2
	},
	tools: {}
};

const codeExplorerTemplate: ModelTemplate = {
	name: "Code Explorer",
	description: "Explore alternative code solutions",
	settings: {
		modelIDs: ["openai:gpt-4-turbo"],
		systemMessage: "You are a code explainer",
		temperature: 0.6,
		topP: 0.7
	},
	tools: {}
};

export const modelTemplates: ModelTemplate[] = [
	casualChatTemplate,
	creativeWritingTemplate,
	codeGenerationTemplate,
	codeExplorerTemplate
];
