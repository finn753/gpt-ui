import { availableModels } from "$lib/scripts/misc/stores";
import { get } from "svelte/store";
import { type MessageFormat, ModelWrapper } from "$lib/scripts/api-wrapper/ModelWrapper";
import {
	compileToJS,
	executeFunction,
	extractFunctionInfo,
	type FunctionInfo
} from "$lib/scripts/tools/code-helper";

const toolConceptPrompt =
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
	"Pack it all together in one coherent sentence with as few words as possible";

const toolGenerationPrompt =
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
	'e.g.: { result: "The result of the function" }\n' +
	"\n" +
	"For typescript make the return a verbose type, so exactly state which keys and which type.\n" +
	"e.g. { output1: string, output2: number}\n" +
	"No nested return objects, e.g. { output1: {a: string, b: string} } is not allowed\n" +
	"\n" +
	"All outputs should go into the return value, no console logs or other outputs.\n" +
	"\n" +
	"Only return the function, no usage example";

function getToolModel() {
	const modelOptions = ["openai:gpt-4o", "openai:gpt-3.5-turbo"];
	const availableModelIds = get(availableModels).map((model) => model.id);

	const modelId =
		modelOptions.find((model) => availableModelIds.includes(model)) || availableModelIds[0];
	if (!modelId) return;

	return new ModelWrapper(modelId);
}

async function generateToolConcept(toolDescription: string) {
	const model = getToolModel();
	if (!model) return;
	model.params = { temperature: 0.5, top_p: 0.8 };

	return formatGeneratedCode(await model.prompt(toolDescription, toolConceptPrompt));
}

async function generateToolCode(toolDescription: string) {
	const model = getToolModel();
	if (!model) return;
	model.params = { temperature: 0.2, top_p: 0.3 };

	return formatGeneratedCode(await model.prompt(toolDescription, toolGenerationPrompt));
}

async function iterateToolGeneration(
	toolDescription: string,
	resultedCode: string,
	feedback: string
) {
	const model = getToolModel();
	if (!model) return;
	model.params = { temperature: 0.2, top_p: 0.3 };

	const messages: MessageFormat[] = [
		{ role: "system", content: toolGenerationPrompt },
		{ role: "user", content: toolDescription },
		{ role: "assistant", content: resultedCode },
		{ role: "user", content: feedback }
	];

	return formatGeneratedCode(await model.promptChat(messages));
}

function formatGeneratedCode(code: string) {
	return code
		.replace(/^```typescript\n/, "")
		.replace(/```$/, "")
		.replace(/```/, "");
}

async function getToolGenerationFeedback(tsCode: string) {
	const feedback: string[] = [];

	let functionTree: FunctionInfo[] | undefined;
	const parameterTypes: string[] = [];

	try {
		functionTree = extractFunctionInfo(tsCode);
		const jsCode = compileToJS(tsCode);
		const mockInput = functionTree[0].parameters.reduce<Record<string, unknown>>((acc, param) => {
			if (param.type.includes("[]")) {
				acc[param.name] =
					param.type === "string[]"
						? ["string1", "string2"]
						: param.type === "number[]"
							? [1, 2]
							: [
									new File(["file1 content"], "file1.txt", { type: "text/plain" }),
									new File(["file2 content"], "file2.txt", { type: "text/plain" })
								];
			} else {
				acc[param.name] =
					param.type === "string"
						? "string"
						: param.type === "number"
							? 1
							: new File(["file1 content"], "file1.txt", { type: "text/plain" });
			}

			parameterTypes.push(param.type);
			return acc;
		}, {});

		await executeFunction(jsCode, functionTree[0], mockInput);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error:", error);
			feedback.push("Code is not valid: " + error.message);
		}
	}

	if (!functionTree) return feedback;

	if (tsCode.includes("import")) {
		feedback.push("Code should not contain imports.");
	}

	if (functionTree.length > 1) {
		feedback.push("Code should not contain helper functions.");
	}

	if (tsCode.includes("fetch(")) {
		feedback.push("Code should not contain fetch requests.");
	}

	if (tsCode.includes("console.log")) {
		feedback.push("Code should not contain console logs.");
	}

	if (parameterTypes.length === 0) {
		feedback.push("Function should have at least one parameter");
	}

	const allowedTypes = ["string", "string[]", "number", "number[]", "File", "File[]"];
	const invalidTypes = parameterTypes.filter((type) => !allowedTypes.includes(type));
	if (invalidTypes.length > 0) {
		feedback.push(`Not allowed typed: ${invalidTypes.join(", ")}`);
	}

	if (!functionTree[0].returnType.startsWith("{")) {
		feedback.push("Output type should be a JSON object");
	}

	if (functionTree[0].returnType.includes(": {")) {
		feedback.push("Output type should not contain nested objects");
	}

	return feedback;
}

export async function generateTool(toolDescription: string, maxIterations = 2) {
	const concept = await generateToolConcept(toolDescription);
	if (!concept) throw new Error("Failed to generate tool concept");

	console.error("Concept:", concept);

	const code = await generateToolCode(concept);
	if (!code) throw new Error("Failed to generate tool code");

	console.error("Code:", code);

	let feedback = await getToolGenerationFeedback(code);

	if (feedback.length === 0) {
		return code;
	}

	for (let i = 0; i < maxIterations; i++) {
		console.error("Feedback:", feedback.join("\n"));

		const newCode = await iterateToolGeneration(toolDescription, code, feedback.join("\n"));
		if (!newCode) throw new Error("Failed to generate tool code");

		console.error("New Code:", newCode);

		const newFeedbackList = await getToolGenerationFeedback(newCode);
		if (newFeedbackList.length === 0) {
			return newCode;
		}

		feedback = newFeedbackList;
	}
}
