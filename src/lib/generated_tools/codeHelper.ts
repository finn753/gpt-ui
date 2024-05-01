import ts from "typescript";

import lodash from "lodash";
import Papa from "papaparse";
import * as pdfLib from "pdf-lib";
import pica from "pica";
import chroma from "chroma-js";
import CryptoJS from "crypto-js";
import * as errorHandler from "$lib/scripts/operations/error-handler";

export type LoadOutput = ReturnType<typeof getToolDataFromTsCode>;

const libraries = { lodash, Papa, pdfLib, pica, chroma, CryptoJS };

export function compileToJS(tsCode: string) {
	return ts.transpileModule(tsCode, {
		compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
	}).outputText;
}

export function extractFunctionInfo(tsCode: string): Array<{
	name: string;
	returnType: string;
	outputRenderTypeObject: Record<string, string>;
	parameters: Array<{ name: string; type: string }>;
}> {
	const sourceFile = ts.createSourceFile("temp.ts", tsCode, ts.ScriptTarget.Latest, true);
	const functions: Array<{
		name: string;
		returnType: string;
		outputRenderTypeObject: Record<string, string>;
		parameters: Array<{ name: string; type: string }>;
	}> = [];

	function visit(node: ts.Node) {
		if (ts.isFunctionDeclaration(node) && node.name) {
			const funcName = node.name.getText();
			const returnType = node.type ? node.type.getText() : "void";
			const parameters = node.parameters.map((parameter) => ({
				name: parameter.name.getText(),
				type: parameter.type ? parameter.type.getText() : "any"
			}));

			let outputRenderType = returnType.replace(/Promise<([^>]*)>/g, "$1");
			if (outputRenderType[0] !== "{") {
				outputRenderType = `{ "Output": "${outputRenderType}" }`;
			} else {
				outputRenderType = outputRenderType.replace(/(\w+): (\w+(\[])?)/g, '"$1": "$2"');
			}
			const outputRenderTypeObject: Record<string, string> = JSON.parse(outputRenderType);

			functions.push({ name: funcName, returnType, outputRenderTypeObject, parameters });
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	return functions;
}

export async function executeFunction(data: LoadOutput, input: Record<string, never>) {
	if (!data) return;

	const args: never[] = [];
	for (const param of data.functionTree[0].parameters) {
		const value = input[param.name];

		if (value === undefined || value === null) {
			return undefined;
		}

		args.push(value);
	}

	const func = new Function(...Object.keys(libraries), "return " + data.jsCode)(
		...Object.values(libraries)
	);
	return await func.call(null, ...args);
}

export function getToolDataFromTsCode(tsCode: string) {
	const jsCode = compileToJS(tsCode);

	try {
		const functionTree = extractFunctionInfo(tsCode);

		return { tsCode, jsCode, functionTree };
	} catch (e) {
		errorHandler.handleError("An error occurred while generating the tool", e);
	}
}
