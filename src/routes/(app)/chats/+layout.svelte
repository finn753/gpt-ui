<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import { onMount } from "svelte";
	import ContextSidebar from "$lib/components/chat/ContextSidebar.svelte";
	import { chatDataMap, selectedChatID } from "$lib/scripts/misc/stores";
	import ChatList from "$lib/components/chat/ChatList.svelte";

	export let data;

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

	onMount(async () => {
		if (window.innerWidth >= 768) {
			leftOpened = true;
			rightOpened = true;
		}

		chatDataMap.set(await data.chatDataMap);
	});
</script>

<svelte:window on:resize={() => handleMobileSidebar()} />

<div class="relative grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
	<CollapsibleSidebar
		class="z-10"
		title="Chats"
		bind:isOpen={leftOpened}
		on:open={() => handleMobileSidebar("left")}
	>
		<ChatList chatMap={$chatDataMap} />
	</CollapsibleSidebar>
	<div class="col-span-1 h-full max-h-full min-h-0 lg:col-span-2">
		<slot />
	</div>
	<CollapsibleSidebar
		title={$selectedChatID ? "Context" : "New Chat"}
		orientation="right"
		bind:isOpen={rightOpened}
		on:open={() => handleMobileSidebar("right")}
	>
		<ContextSidebar chatID={$selectedChatID || undefined} />
	</CollapsibleSidebar>
</div>
