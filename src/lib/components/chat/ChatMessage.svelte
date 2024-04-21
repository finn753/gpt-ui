<script lang="ts">
	import { format } from "date-fns";
	import { Button } from "$lib/components/ui/button";
	import { Clipboard } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import type { MessageStructure } from "$lib/types";
	import SvelteMarkdown from "svelte-markdown";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher<{ retry: { message: MessageStructure } }>();

	export let message: MessageStructure;

	let role: string = "";
	let model: string = "";
	let content: string = "";
	let created_at: Date = new Date(Date.now());
	let failed = false;

	$: {
		role = message.role;
		model = message.model;
		content = message.content;
		created_at = message.created_at;
		failed = message.failed || false;
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(content);
		toast.success("Copied to clipboard");
	}

	function onRetry() {
		dispatch("retry", { message });
	}
</script>

<div class="group p-4 pb-0">
	<div class="flex flex-row items-center justify-between">
		<h3 class="text-lg font-bold">{role} {model}</h3>
		<p class="ml-2 text-sm text-muted-foreground">{format(created_at, "PP, HH:mm")}</p>
	</div>

	{#if message.tool_calls}
		<div>
			<p class="text-sm text-muted-foreground">Calling tools:</p>
			<ul>
				{#each message.tool_calls as tool}
					<li class="text-sm text-muted-foreground">- {tool.function.name}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<p
		class="prose dark:prose-invert
  prose-h1:text-xl prose-h1:font-bold
  prose-p:text-justify prose-a:text-blue-600 prose-img:rounded-xl"
	>
		<SvelteMarkdown source={content} />
	</p>

	{#if failed}
		<div class="flex justify-between text-red-500">
			<p>Failed to send message</p>
			<span
				><Button class="text-red-500" variant="link" size="none" on:click={onRetry}>Retry</Button
				></span
			>
		</div>
	{/if}

	<div class="flex flex-row items-center py-2 opacity-0 transition-opacity group-hover:opacity-100">
		<Button
			class="p-0 opacity-50 hover:opacity-100"
			variant="icon"
			size="none"
			on:click={copyToClipboard}><Clipboard size={20} /></Button
		>
	</div>
</div>
