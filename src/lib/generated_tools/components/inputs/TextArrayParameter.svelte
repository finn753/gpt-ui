<script lang="ts">
	import ToolCard from "$lib/generated_tools/components/ToolCard.svelte";
	import { Input } from "$lib/components/ui/input";
	import { cn } from "$lib/scripts/misc/utils";
	import { inputStyleClasses } from "$lib/generated_tools/components/ui/input/index.js";

	export let value: string[];
	export let id: never;

	export let type: "text" | "number" = "text";

	let className: string | null | undefined = "";
	export { className as class };

	let textList: never[] = [];
	let newValue: null = null;

	function init(el: HTMLElement) {
		el.focus();
	}

	function handleBlur() {
		textList = textList.filter((item) => item !== null && item !== "");
	}

	$: {
		if (newValue) {
			textList = [...textList, newValue];
			newValue = null;
		}

		value = textList;
	}
</script>

<ToolCard class={cn("overflow-clip", className)}>
	<label for={textList.length.toString()} class="p-4 pb-2 text-lg font-semibold">{id}</label>
	<div class="space-y-1 overflow-y-auto p-2">
		{#each textList as item, index}
			{#if type === "text"}
				<input
					type="text"
					class={inputStyleClasses}
					id={index.toString()}
					bind:value={item}
					placeholder={id}
					use:init
					on:blur={handleBlur}
				/>
			{:else if type === "number"}
				<input
					type="number"
					class={inputStyleClasses}
					id={index.toString()}
					bind:value={item}
					placeholder={id}
					use:init
					on:blur={handleBlur}
				/>
			{/if}
		{/each}

		<Input id={textList.length.toString()} bind:value={newValue} placeholder={id} />
	</div>
</ToolCard>
