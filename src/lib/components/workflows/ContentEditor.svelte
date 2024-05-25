<script lang="ts">
	// @ts-expect-error - svelte-autosize doesn't have types
	import autosize from "svelte-autosize";
	import { onMount, afterUpdate } from "svelte";
	import { cn } from "$lib/utils";

	let valueSegments: string[] = [];
	export let value = "";
	export let disabled = false;
	export let placeholder = "";

	onMount(() => (valueSegments = value.split("\n\n")));
	$: valueSegments = value.split("\n\n");

	afterUpdate(() => (value = valueSegments.join("\n\n")));

	function handleKeyDown(i: number, event: KeyboardEvent) {
		const target = event.target as HTMLTextAreaElement;

		if (
			event.key === "Backspace" &&
			target.selectionStart === 0 &&
			target.selectionEnd === 0 &&
			i > 0
		) {
			event.preventDefault();
			if (valueSegments[i] === "") {
				valueSegments = valueSegments.toSpliced(i, 1);
			} else {
				valueSegments[i - 1] += "\n" + valueSegments[i];
				valueSegments.splice(i, 1);
			}
		}
	}

	function getStyleClassesForValue(value: string) {
		if (value.startsWith("# ")) return "text-4xl font-bold";
		if (value.startsWith("## ")) return "text-3xl font-bold";
		if (value.startsWith("### ")) return "text-2xl font-bold";
		if (value.startsWith("#### ")) return "text-xl font-bold";
		if (value.startsWith("##### ")) return "text-lg font-bold";
		if (value.startsWith("###### ")) return "text-base font-bold";
		return "";
	}
</script>

<div
	class="relative h-full max-h-full overflow-y-auto rounded-3xl bg-muted-foreground bg-opacity-20"
>
	<div class="flex flex-col">
		{#each valueSegments as segment, i (i)}
			<textarea
				class={cn(
					"h-[3.5rem] min-h-0 w-full resize-none rounded-xl bg-transparent p-4 pb-0 outline-none transition-colors duration-300 placeholder:text-muted-foreground hover:bg-muted-foreground hover:bg-opacity-50",
					getStyleClassesForValue(segment)
				)}
				bind:value={segment}
				use:autosize
				{disabled}
				{placeholder}
				on:keydown={(event) => handleKeyDown(i, event)}
			/>
		{/each}
	</div>
</div>
