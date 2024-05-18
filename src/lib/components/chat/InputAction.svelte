<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let title = "Action";
	export let actionWord = "";
	export let actionElements: { name: string; element: unknown }[] = [];
	export let selectedElement: unknown;

	let selectedElementIndex = 0;
	let elementRefs: HTMLElement[] = [];

	$: query = actionWord.slice(1).toLowerCase();

	$: filteredElements = actionElements.filter((element) => {
		return element.name.toLowerCase().replaceAll(" ", "").includes(query);
	});

	$: if (filteredElements.length > selectedElementIndex && filteredElements[selectedElementIndex]) {
		selectedElement = filteredElements[selectedElementIndex].element;
	}

	$: selectedElementIndex = Math.max(0,Math.min(selectedElementIndex, filteredElements.length - 1));

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			selectedElementIndex = Math.max(0, selectedElementIndex - 1);
		} else if (event.key === 'ArrowDown') {
			selectedElementIndex = Math.min(filteredElements.length - 1, selectedElementIndex + 1);
		}

		const element = elementRefs[selectedElementIndex];

		element.scrollIntoView({ behavior: 'instant' });
	}
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="flex flex-col max-h-48 overflow-y-auto p-2">
	<h3 class="text-xl font-semibold p-2 pt-0">{title}</h3>
	{#each filteredElements as { name }, index}
		<div bind:this={elementRefs[index]}></div>
		<Button variant={index === selectedElementIndex ? "glass" : "ghost"} class="justify-start" on:click={() => {selectedElementIndex = index}}>{name}</Button>
	{/each}
</div>
