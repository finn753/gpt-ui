import OpenAI from "openai";
import ollama from "ollama/browser";
import { openaiApiKey } from "$lib/stores";
import { get } from "svelte/store";
import type { ModelType } from "$lib/types";
import { ChatOpenAI } from "@langchain/openai";
import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";

export async function getAvailableModels(): Promise<ModelType[]> {
	const models: ModelType[] = [];

	models.push(...(await getAvailableOllamaModels()));
	models.push(...(await getAvailableOpenAIModels()));

	return models;
}

export async function getAvailableOpenAIModels(): Promise<ModelType[]> {
	try {
		const openAI = new OpenAI({ apiKey: get(openaiApiKey) ?? "", dangerouslyAllowBrowser: true });
		return (await openAI.models.list()).data
			.filter((model) => /ft:|gpt-/.test(model.id))
			.filter((model) => /(gpt-3.5-turbo|gpt-4-turbo)$/.test(model.id))
			.map((model) => ({
				id: "openai:" + model.id,
				name: model.id,
				provider: "openai",
				vision: model.id.includes("vision") || model.id === "gpt-4-turbo"
			}));
	} catch (e: unknown) {
		console.error(e);
		return [];
	}
}

export async function getAvailableOllamaModels(): Promise<ModelType[]> {
	try {
		return (await ollama.list()).models.map((model) => ({
			id: "ollama:" + model.name,
			name: model.name,
			provider: "ollama",
			vision: model.details.families.includes("clip")
		}));
	} catch (e: unknown) {
		console.error(e);
		return [];
	}
}

export function getLangchainModelById(
	id: string,
	options?: { temperature?: number; topP?: number }
) {
	const [provider, modelName] = id.split(":");

	switch (provider) {
		case "openai":
			return new ChatOpenAI(
				{ openAIApiKey: get(openaiApiKey) ?? "", modelName, ...options },
				{ dangerouslyAllowBrowser: true }
			);
		case "ollama":
			return new OllamaFunctions({ model: modelName, ...options });
		default:
			throw new Error(`Provider ${provider} not supported`);
	}
}
