<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import { onMount } from "svelte";
	import ContextSidebar from '$lib/components/chat/ContextSidebar.svelte';

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
		if (window.innerWidth >= 768) {
			leftOpened = true;
			rightOpened = true;
		}
	});
</script>

<svelte:window on:resize={() => handleMobileSidebar()} />

<div class="relative grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
	<CollapsibleSidebar
		class="z-10"
		title="Chats"
		bind:isOpen={leftOpened}
		on:open={() => handleMobileSidebar("left")}>
		Test
	</CollapsibleSidebar>
	<div class="col-span-1 h-full min-h-0 max-h-full lg:col-span-2">
		<slot />
	</div>
	<CollapsibleSidebar
		title="Context"
		orientation="right"
		bind:isOpen={rightOpened}
		on:open={() => handleMobileSidebar("right")}
	>
		<ContextSidebar title="Chat Title" tags={["Test","Test2"]} contextMessages={[]} summary="Summary Text \n summ summ sumamry \n summmy \n Text Test"/>
	</CollapsibleSidebar>
</div>
