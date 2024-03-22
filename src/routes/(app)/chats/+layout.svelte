<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import { onMount } from 'svelte';

	let leftOpened = false;
	let rightOpened = false;

	function handleMobileSidebar(from: "left" | "right" = "left") {
		if (window.innerWidth < 768) {
			if (from === "left") {
				rightOpened = false;
			} else {
				leftOpened = false;
			}
		}
	}

	onMount(() => {
		if(window.innerWidth >= 768) {
			leftOpened = true;
			rightOpened = true;
		}
	});
</script>

<svelte:window on:resize={() => handleMobileSidebar()}/>

<div class="relative h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
	<div class="col-span-1 absolute w-full h-full pointer-events-none md:relative md:w-auto">
		<CollapsibleSidebar title="Chats" bind:isOpen={leftOpened} on:open={() => handleMobileSidebar("left")}>Test</CollapsibleSidebar>
	</div>
	<div class="col-span-1 lg:col-span-2">
		<slot />
	</div>
	<div class="col-span-1 absolute w-full h-full pointer-events-none md:relative md:w-auto">
		<CollapsibleSidebar title="Context" orientation="right" bind:isOpen={rightOpened} on:open={() => handleMobileSidebar("right")}>Testilein</CollapsibleSidebar>
	</div>
</div>
