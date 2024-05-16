import OpenAI from "openai";
import ollama from "ollama/browser";
import { availableModels, mistralApiKey, openaiApiKey } from "$lib/scripts/misc/stores";
import { get } from "svelte/store";
import MistralClient from "@mistralai/mistralai";
import type { ModelType } from "$lib/scripts/misc/types";

class ModelManager {
	public async getAvailableModels(): Promise<ModelType[]> {
		const models: ModelType[] = [];

		models.push(...(await this.getAvailableOllamaModels()));
		models.push(...(await this.getAvailableOpenAIModels()));
		models.push(...(await this.getAvailableMistralModels()));

		return models;
	}

	public async getAvailableOpenAIModels(): Promise<ModelType[]> {
		try {
			const openAI = new OpenAI({ apiKey: get(openaiApiKey) ?? "", dangerouslyAllowBrowser: true });
			return (await openAI.models.list()).data
				.filter((model) => /ft:|gpt-/.test(model.id))
				.filter((model) => /(gpt-3.5-turbo|gpt-4-turbo|gpt-4o)$/.test(model.id))
				.map((model) => ({
					id: "openai:" + model.id,
					name: model.id,
					provider: "openai",
					vision: model.id.includes("vision") || model.id === "gpt-4-turbo" || model.id === "gpt-4o"
				}));
		} catch (e: unknown) {
			console.error(e);
			return [];
		}
	}

	public async getAvailableOllamaModels(): Promise<ModelType[]> {
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

	public async getAvailableMistralModels(): Promise<ModelType[]> {
		try {
			const mistral = new MistralClient(get(mistralApiKey) ?? "");
			const models = await mistral.listModels();

			console.error(models);

			return models.data.map((model) => ({
				id: "mistral:" + model.id,
				name: model.id,
				provider: "mistral",
				vision: false
			}));
		} catch (e: unknown) {
			console.error(e);
			return [];
		}
	}

	public getModelInfoById(modelId: string) {
		const models = get(availableModels);
		return models.find((model) => model.id === modelId);
	}

	public getDefaultModelId() {
		const models = get(availableModels);

		if (models.length === 0) {
			throw new Error("No models available");
		}

		if (models.find((model) => model.id === "openai:gpt-3.5-turbo")) {
			return "openai:gpt-3.5-turbo";
		}

		return models[0].id;
	}
}

export default new ModelManager();
