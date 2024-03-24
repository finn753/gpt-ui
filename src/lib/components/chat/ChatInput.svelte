<script lang="ts">
	import { Button } from "$lib/components/ui/button";

	import { SendHorizontal } from "lucide-svelte";
	import { cn } from "$lib/utils";

	let input: HTMLTextAreaElement;

	let cursorPos = 0;
	let actionWord: string = "";
	$: actionWord =
		value
			.slice(0, cursorPos)
			.split(/[\s\n]+/)
			.pop() || "";
	$: {
		isActionCommand = false;
		isActionMention = false;

		if (actionWord.startsWith("/")) {
			isActionCommand = true;
		}

		if (actionWord.startsWith("@")) {
			isActionMention = true;
		}
	}

	let isActionCommand = false;
	let isActionMention = false;

	let value = "";
	let rows = 1;
	$: rows = value.split("\n").length;

	function updateCursorPos() {
		cursorPos = input.selectionStart;
	}
</script>

<div class="rounded-2lg bg-background">
	<div class={cn(isActionCommand ? "block" : "hidden")}>Command: {actionWord}</div>
	<div class={cn(isActionMention ? "block" : "hidden")}>Mention: {actionWord}</div>

	<div class="flex flex-row items-end">
		<textarea
			class="max-h-[25dvh] min-h-0 flex-1 resize-none rounded-2lg border-none bg-background p-4 leading-normal outline-none placeholder:text-muted-foreground"
			style="height: calc({rows} * 1.5em + 2rem);"
			bind:value
			bind:this={input}
			on:click={updateCursorPos}
			on:keyup={updateCursorPos}
			placeholder="Type here..."
		/>
		<div class="p-2" style="width: calc(1.5em + 2rem); height: calc(1.5em + 2rem);">
			<Button variant="ghost" class="size-full p-2">
				<SendHorizontal size={24} />
			</Button>
		</div>
	</div>
</div>
