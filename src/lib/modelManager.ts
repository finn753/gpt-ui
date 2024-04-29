import OpenAI from "openai";
import ollama from "ollama/browser";
import { availableModels, openaiApiKey } from "$lib/stores";
import { get } from "svelte/store";
import type { ModelType } from "$lib/types";

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
			vision: model.details.families?.includes("clip") || false
		}));
	} catch (e: unknown) {
		console.error(e);
		return [];
	}
}

export function getModelInfoById(modelId: string) {
	const models = get(availableModels);
	return models.find((model) => model.id === modelId);
}

export function getDefaultModelId() {
	const models = get(availableModels);

	if (models.length === 0) {
		throw new Error("No models available");
	}

	if (models.find((model) => model.id === "openai:gpt-3.5-turbo")) {
		return "openai:gpt-3.5-turbo";
	}

	return models[0].id;
}
