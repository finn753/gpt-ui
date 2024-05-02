import { test } from "vitest";

import { render } from "@testing-library/svelte";

import ChatsPage from "../src/routes/(app)/chats/+page.svelte";

import ImageGeneratorPage from "../src/routes/(app)/generator/images/+page.svelte";
import VoiceGeneratorPage from "../src/routes/(app)/generator/voice/+page.svelte";
import ToolsGeneratorPage from "../src/routes/(app)/generator/tools/+page.svelte";

import AccountSettingsPage from "../src/routes/(app)/settings/account/+page.svelte";
import DataSettingsPage from "../src/routes/(app)/settings/data/+page.svelte";
import IntegrationsSettingsPage from "../src/routes/(app)/settings/integrations/+page.svelte";
import StatisticsSettingsPage from "../src/routes/(app)/settings/statistics/+page.svelte";

test("no page render errors", async () => {
	const pages = [
		ChatsPage,
		AccountSettingsPage,
		DataSettingsPage,
		IntegrationsSettingsPage,
		StatisticsSettingsPage,
		ImageGeneratorPage,
		VoiceGeneratorPage,
		ToolsGeneratorPage
	];

	pages.forEach((page) => {
		render(page);
	});
});
