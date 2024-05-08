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
	name: "Conversational Chat",
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
	name: "Creative Writing",
	description: "A model for creative writing",
	settings: {
		modelIDs: ["openai:gpt-4-turbo"],
		systemMessage: "You are a creative writer",
		temperature: 0.7,
		topP: 0.8
	},
	tools: {}
};

const codeGenerationTemplate: ModelTemplate = {
	name: "Code Generation",
	description: "A model for generating code",
	settings: {
		modelIDs: ["openai:gpt-4-turbo"],
		systemMessage: "You are a code generator",
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
