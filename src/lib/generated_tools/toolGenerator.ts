import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { openaiApiKey } from "$lib/stores";
import { get } from "svelte/store";

const outputParser = new StringOutputParser();

const conceptPrompt = new PromptTemplate({
	inputVariables: ["input"],
	template:
		"Envision a tool based on the users input and describe it in one sentence.\n" +
		"The tool should be possible to implement in a ts function, that runs in the browser.\n" +
		"\n" +
		"Mention the inputs and outputs, the main functionality and other useful features.\n" +
		"When logical and possible, add more inputs and outputs to enhance the functionality.\n" +
		"Fully describe each feature, don't just say 'options'.\n" +
		"\n" +
		"Tools should only have one main functionality, but can have multiple inputs and outputs.\n" +
		"Don't add options for different functionalities.\n" +
		"\n" +
		"Pack it all together in one coherent sentence with as few words as possible.\n" +
		"\n" +
		"Input:\n" +
		"{input}"
});

const functionPrompt = new PromptTemplate({
	inputVariables: ["input"],
	template:
		"Generate a typescript function based on a users concept.\n" +
		"\n" +
		"Develop the full function and DO NOT leave out things by saying // Insert ... here\n" +
		"If you can't implement a feature, don't include it in the input and output parameters.\n" +
		"\n" +
		"The function should be a function, not const.\n" +
		"Additionally keep everything in one function,\n" +
		"don't use helper functions or include them as sub functions inside the parent function\n" +
		"\n" +
		"These libraries are available:\n" +
		"Papa from 'papaparse', * as pdfLib from 'pdf-lib', pica from 'pica', chroma from 'chroma-js', CryptoJS from 'crypto-js'\n" +
		"You can't import or use additional libraries.\n" +
		"I repeat, DO NOT import anything, all the available libraries are already imported\n" +
		"\n" +
		"Possible input/output types are string, number, File and their arrays (File[] etc.) only!\n" +
		"Only include inputs and outputs that are used, no placeholders, no optional outputs\n" +
		"File handling requires an async function, so use async/await if needed.\n" +
		"\n" +
		"Wrap the return value into a JSON object with a name as the key and a value\n" +
		'e.g.: {{ result: "The result of the function" }}\n' +
		"\n" +
		"For typescript make the return a verbose type, so exactly state which keys and which type.\n" +
		"e.g. {{ output1: string, output2: number}}\n" +
		"\n" +
		"All outputs should go into the return value, no console logs or other outputs.\n" +
		"\n" +
		"Only return the function, no usage example.\n" +
		"\n" +
		"Concept:\n" +
		"{input}"
});

export async function generateTool(prompt: string): Promise<string> {
	const llm = new ChatOpenAI({
		openAIApiKey: get(openaiApiKey) || undefined,
		modelName: "gpt-3.5-turbo"
	});

	const conceptChain = conceptPrompt.pipe(llm).pipe(outputParser);
	const functionChain = functionPrompt.pipe(llm).pipe(outputParser);

	const concept = await conceptChain.invoke({ input: prompt });
	let response = await functionChain.invoke({ input: concept });

	//If first line has ```typescript, remove it and if last line has ``` remove it
	response = response
		.replace(/^```typescript\n/, "")
		.replace(/```$/, "")
		.replace(/```/, "");

	return response;
}
