<script lang="ts">
	import { format } from "date-fns";
	import { Button } from "$lib/components/ui/button";
	import { Clipboard } from "lucide-svelte";
	import { toast } from "svelte-sonner";

	export const id: string = "";
	export let role: string;
	export let model: string;
	export let text: string;
	export let created_at: Date;

	function copyToClipboard() {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	}
</script>

<div class="group p-4 pb-0">
	<div class="flex flex-row items-center justify-between">
		<h3 class="text-lg font-bold">{role} {model}</h3>
		<p class="ml-2 text-sm text-muted-foreground">{format(created_at, "PP, HH:mm")}</p>
	</div>
	<p>
		{text}
	</p>
	<div class="flex flex-row items-center py-2 opacity-0 transition-opacity group-hover:opacity-100">
		<Button class="p-0" variant="icon" size="none" on:click={copyToClipboard}
			><Clipboard size={20} /></Button
		>
	</div>
</div>
