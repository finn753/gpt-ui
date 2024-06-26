<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { MessagesSquare, User, Brush, Wrench, PencilRuler } from "lucide-svelte";
	import {
		anthropicApiKey,
		availableModels,
		customModelTemplates,
		geminiApiKey,
		groqApiKey,
		memoryLDS,
		mistralApiKey,
		openaiApiKey,
		perplexityApiKey,
		tavilyApiKey,
		userTagMap
	} from "$lib/scripts/misc/stores";
	import { initializeModel } from "client-vector-search";
	import { onMount } from "svelte";

	import { page } from "$app/stores";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import modelManager from "$lib/scripts/chat/model-manager";

	$: currentPath = $page.url.pathname;

	export let data;

	$: if (data) {
		openaiApiKey.set(data.openaiApiKey);
		tavilyApiKey.set(data.tavilyApiKey);
		groqApiKey.set(data.groqApiKey);
		mistralApiKey.set(data.mistralApiKey);
		anthropicApiKey.set(data.anthropicApiKey);
		perplexityApiKey.set(data.perplexityApiKey);
		geminiApiKey.set(data.geminiApiKey);

		customModelTemplates.set(data.customModelTemplates);

		memoryLDS.set(data.memories);

		userTagMap.set(data.tags);
	}

	onMount(async () => {
		try {
			availableModels.set(await modelManager.getAvailableModels());
			await initializeModel();
		} catch (e) {
			console.error(e);
		}
	});
</script>

<div class="flex h-dvh max-h-dvh w-dvw flex-col-reverse md:flex-row">
	<div
		class="z-20 flex h-16 w-dvw items-center justify-evenly bg-background p-4 shadow-lg md:h-dvh md:w-16 md:flex-col md:space-y-4"
	>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/chats") ? "secondary" : "ghost"}
					class={currentPath.startsWith("/chats") ? "" : "opacity-50"}
					href="/chats"
				>
					<MessagesSquare />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Chats</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/generator") ? "secondary" : "ghost"}
					href="/generator"
					class={currentPath.startsWith("/generator") ? "" : "opacity-50"}
				>
					<Brush />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Generator</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/tools") ? "secondary" : "ghost"}
					href="/tools"
					class={currentPath.startsWith("/tools") ? "" : "opacity-50"}
				>
					<Wrench />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Tools</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/workflows") ? "secondary" : "ghost"}
					href="/workflows"
					class={currentPath.startsWith("/workflows") ? "" : "opacity-50"}
				>
					<PencilRuler />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Workflows</Tooltip.Content>
		</Tooltip.Root>

		<div class="hidden md:block md:flex-1"></div>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/settings") ? "secondary" : "ghost"}
					href="/settings"
					class={currentPath.startsWith("/settings") ? "" : "opacity-50"}
				>
					<User />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Settings</Tooltip.Content>
		</Tooltip.Root>
	</div>
	<div class="h-[calc(100dvh-4rem)] flex-1 md:h-dvh">
		<slot />
	</div>
</div>
