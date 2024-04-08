<script lang="ts">
	import { Button } from "$lib/components/ui/button";

	import { LoaderCircle, SendHorizontal } from 'lucide-svelte';
	import { cn } from "$lib/utils";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher<{ submit: { value: string } }>();

	export let generating = false;

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

	export let value = "";
	let rows = 1;
	$: rows = value.split("\n").length;

	function updateCursorPos() {
		cursorPos = input.selectionStart;
	}

	function send() {
		if(value.trim() === "") return;

		dispatch("submit", { value });
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			send();
		}
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
			on:keydown={onKeyDown}
			placeholder={generating ? "Generating..." : "Type here..." }
			disabled={generating}
		/>
		<div class="p-2" style="width: calc(1.5em + 2rem); height: calc(1.5em + 2rem);">
			{#if !generating}
				<Button variant="ghost" class="size-full p-2" on:click={send} disabled={value.trim() === ""}>
					<SendHorizontal size={24} />
				</Button>
			{:else}
				<div class="size-full p-2">
					<LoaderCircle class="animate-spin opacity-50" size={24} />
				</div>
			{/if}
		</div>
	</div>
</div>
