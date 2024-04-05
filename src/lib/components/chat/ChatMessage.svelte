<script lang="ts">
	import { format } from "date-fns";
	import { Button } from "$lib/components/ui/button";
	import { Clipboard } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import type { MessageStructure } from "$lib/types";
	import SvelteMarkdown from "svelte-markdown";

	export let message: MessageStructure;

	let role: string = "";
	let model: string = "";
	let content: string = "";
	let created_at: Date = new Date(Date.now());

	$: {
		role = message.role;
		model = message.model;
		content = message.content;
		created_at = message.created_at;
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(content);
		toast.success("Copied to clipboard");
	}
</script>

<div class="group p-4 pb-0">
	<div class="flex flex-row items-center justify-between">
		<h3 class="text-lg font-bold">{role} {model}</h3>
		<p class="ml-2 text-sm text-muted-foreground">{format(created_at, "PP, HH:mm")}</p>
	</div>
	<p
		class="prose dark:prose-invert
  prose-h1:text-xl prose-h1:font-bold
  prose-p:text-justify prose-a:text-blue-600 prose-img:rounded-xl"
	>
		<SvelteMarkdown source={content} />
	</p>
	<div class="flex flex-row items-center py-2 opacity-0 transition-opacity group-hover:opacity-100">
		<Button class="p-0" variant="icon" size="none" on:click={copyToClipboard}
			><Clipboard size={20} /></Button
		>
	</div>
</div>
