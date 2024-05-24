import ts from "typescript";

import lodash from "lodash";
import Papa from "papaparse";
import * as pdfLib from "pdf-lib";
import pica from "pica";
import chroma from "chroma-js";
import CryptoJS from "crypto-js";

const libraries = { lodash, Papa, pdfLib, pica, chroma, CryptoJS };

export type FunctionInfo = {
	name: string;
	returnType: string;
	parameters: { name: string; type: string }[];
};

export function compileToJS(tsCode: string) {
	return ts.transpileModule(tsCode, {
		compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
	}).outputText;
}

export function extractFunctionInfo(tsCode: string): FunctionInfo[] {
	const sourceFile = ts.createSourceFile("temp.ts", tsCode, ts.ScriptTarget.Latest, true);
	const functions: {
		name: string;
		returnType: string;
		parameters: { name: string; type: string }[];
	}[] = [];

	function visit(node: ts.Node) {
		if (ts.isFunctionDeclaration(node) && node.name) {
			const funcName = node.name.getText();
			const returnType = node.type ? node.type.getText() : "void";
			const parameters = node.parameters.map((parameter) => ({
				name: parameter.name.getText(),
				type: parameter.type ? parameter.type.getText() : "any"
			}));

			functions.push({ name: funcName, returnType, parameters });
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	return functions;
}

export async function executeFunction(
	jsCode: string,
	functionTree: FunctionInfo,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	input: Record<string, any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
	if (!jsCode || !functionTree || !input) return;

	const args = [];
	for (const param of functionTree.parameters) {
		const value = input[param.name];

		if (value === undefined || value === null) {
			return undefined;
		}

		args.push(value);
	}

	const func = new Function(...Object.keys(libraries), "return " + jsCode)(
		...Object.values(libraries)
	);
	return await func.call(null, ...args);
}
