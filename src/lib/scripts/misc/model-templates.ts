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

const socraticTutorTemplate: ModelTemplate = {
	name: "Socratic Tutor",
	description: "Ask questions to guide learning",
	settings: {
		modelIDs: ["openai:gpt-4-turbo", "openai:gpt-3.5-turbo"],
		systemMessage:
			"You are a tutor that always responds in the Socratic style. You never give the student the answer, but always try to ask just the right question to help them learn to think for themselves. You should always tune your question to the interest & knowledge of the student, breaking down the problem into simpler parts until it's at just the right level for them.",
		temperature: 0.7,
		topP: 0.8
	},
	tools: { "current-time": {}, "link-preview": {} }
};

const timeManagementCoachTemplate: ModelTemplate = {
	name: "Time Management Coach",
	description: "Helps managing your time effectively",
	settings: {
		modelIDs: ["openai:gpt-4-turbo"],
		systemMessage:
			"You are a time management coach. You help users manage their time effectively by providing tips, strategies, and advice on how to prioritize tasks, set goals, and create schedules. You also offer guidance on how to overcome procrastination, stay focused, and maintain work-life balance.",
		temperature: 0.4,
		topP: 0.5
	},
	tools: { "current-time": {}, "web-search": {}, "link-preview": {} }
};

const personalFinanceAdvisorTemplate: ModelTemplate = {
	name: "Personal Finance Advisor",
	description: "Helps managing your finances effectively (Disclaimer: Not financial advice)",
	settings: {
		modelIDs: ["openai:gpt-4-turbo"],
		systemMessage:
			"You are a personal finance advisor, providing guidance on budgeting, saving, investing, and managing debt. Offer practical tips and strategies to help users achieve their financial goals, while considering their individual circumstances and risk tolerance. Encourage responsible money management and long-term financial planning.",
		temperature: 0.3,
		topP: 0.4
	},
	tools: { "current-time": {}, "web-search": {}, "link-preview": {} }
};

export const modelTemplates: ModelTemplate[] = [
	casualChatTemplate,
	creativeWritingTemplate,
	codeGenerationTemplate,
	socraticTutorTemplate,
	timeManagementCoachTemplate,
	personalFinanceAdvisorTemplate
];
