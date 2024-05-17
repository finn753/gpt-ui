import { test } from "vitest";

import { render } from "@testing-library/svelte";

import ChatsPage from "../src/routes/(app)/chats/+page.svelte";

import ImageGeneratorPage from "../src/routes/(app)/generator/images/+page.svelte";
import VoiceGeneratorPage from "../src/routes/(app)/generator/voice/+page.svelte";

import AccountSettingsPage from "../src/routes/(app)/settings/account/+page.svelte";
import DataSettingsPage from "../src/routes/(app)/settings/data/+page.svelte";
import OpenAISettingsPage from "../src/routes/(app)/settings/provider/openai/+page.svelte";
import OllamaSettingsPage from "../src/routes/(app)/settings/provider/ollama/+page.svelte";
import MistralSettingsPage from "../src/routes/(app)/settings/provider/mistral/+page.svelte";
import GroqSettingsPage from "../src/routes/(app)/settings/provider/groq/+page.svelte";
import LiveDataSourceSettingsPage from "../src/routes/(app)/settings/chat/lds/+page.svelte";

test("no page render errors", async () => {
	const pages = [
		ChatsPage,
		AccountSettingsPage,
		DataSettingsPage,
		OpenAISettingsPage,
		OllamaSettingsPage,
		MistralSettingsPage,
		GroqSettingsPage,
		LiveDataSourceSettingsPage,
		ImageGeneratorPage,
		VoiceGeneratorPage
	];

	pages.forEach((page) => {
		render(page);
	});
});
