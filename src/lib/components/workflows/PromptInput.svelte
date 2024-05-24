<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	// @ts-expect-error - svelte-autosize doesn't have types
	import autosize from "svelte-autosize";

	import { LoaderCircle, SendHorizontal } from "lucide-svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher<{ submit: { value: string } }>();

	export let generating = false;
	export let value = "";

	let inputElement: HTMLTextAreaElement;

	function send() {
		if (value.trim() === "") return;

		dispatch("submit", { value });

		inputElement.style.height = "calc(1.5em + 2rem)";
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			send();
		}
	}
</script>

<div class="rounded-2lg bg-background">
	<div class="flex flex-row items-end">
		<textarea
			class="h-[calc(1.5em+2rem)] max-h-[25dvh] min-h-0 flex-1 resize-none rounded-2lg border-none bg-background p-4 leading-normal outline-none placeholder:text-muted-foreground"
			bind:value
			bind:this={inputElement}
			use:autosize
			on:keydown={onKeyDown}
			placeholder={generating ? "Generating..." : "Type here..."}
			disabled={generating}
		/>
		<div class="size-[calc(1.5em+2rem)] p-2">
			{#if !generating}
				<Button
					variant="ghost"
					class="size-full p-2"
					on:click={send}
					disabled={value.trim() === ""}
				>
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
