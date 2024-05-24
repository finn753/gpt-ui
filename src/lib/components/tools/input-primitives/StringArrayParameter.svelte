<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	export let value: string[];
	export let id: string;

	let textList: string[] = [];
	let newValue: string = "";

	function init(el: HTMLElement) {
		el.focus();
	}

	function handleBlur() {
		textList = textList.filter((item) => item !== "");
	}

	$: {
		if (newValue) {
			textList = [...textList, newValue];
			newValue = "";
		}

		value = textList;
	}
</script>

<Label>
	{id}
	<div class="flex flex-col gap-1 overflow-y-auto">
		{#each textList as item, index}
			<input
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				id={index.toString()}
				bind:value={item}
				use:init
				on:blur={handleBlur}
			/>
		{/each}

		<Input id={textList.length.toString()} bind:value={newValue} placeholder={id} />
	</div>
</Label>
