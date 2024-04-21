<script>
	import { Button } from "$lib/components/ui/button";
	import { MessagesSquare, User, Images, Brush, LayoutTemplate } from "lucide-svelte";
	import { openaiApiKey, tavilyApiKey } from "$lib/stores";
	import { initializeModel } from "client-vector-search";
	import { onMount } from "svelte";

	import { page } from "$app/stores";
	import * as Tooltip from "$lib/components/ui/tooltip";

	$: currentPath = $page.url.pathname;

	const size = 24;
	const strokeWidth = 2;
	const color = "#64748B";

	export let data;

	$: if (data) {
		openaiApiKey.set(data.openaiApiKey);
		tavilyApiKey.set(data.tavilyApiKey);
	}

	onMount(() => {
		try {
			initializeModel();
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
				<Button variant={currentPath.startsWith("/chats") ? "secondary" : "ghost"} href="/chats">
					<MessagesSquare {size} {strokeWidth} {color} />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Chats</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/generator") ? "secondary" : "ghost"}
					href="/generator"
				>
					<Brush {size} {strokeWidth} {color} />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Generator</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/gallery") ? "secondary" : "ghost"}
					href="/gallery"
				>
					<Images {size} {strokeWidth} {color} />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Gallery</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/templates") ? "secondary" : "ghost"}
					href="/templates"
				>
					<LayoutTemplate {size} {strokeWidth} {color} />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Templates</Tooltip.Content>
		</Tooltip.Root>

		<div class="hidden md:block md:flex-1"></div>

		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant={currentPath.startsWith("/settings") ? "secondary" : "ghost"}
					href="/settings"
				>
					<User {size} {strokeWidth} {color} />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Settings</Tooltip.Content>
		</Tooltip.Root>
	</div>
	<div class="h-[calc(100dvh-4rem)] flex-1 md:h-dvh">
		<slot />
	</div>
</div>
