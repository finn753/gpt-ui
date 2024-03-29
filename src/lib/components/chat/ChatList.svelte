<script lang="ts">
	import type { ChatDataMap } from "$lib/types";
	import { Button } from "$lib/components/ui/button";

	export let chatMap: ChatDataMap = {};
</script>

<Button class="w-full" href="/chats">New chat</Button>
{#each Object.entries(chatMap) as [chatId, chat]}
	<Button variant="ghost" class="flex w-full flex-col" href="/chats/{chatId}">
		<h2>{chat.title.trim() === "" ? "Untitled" : chat.title}</h2>
		<p>{chat.summary.trim() === "" ? "No summary" : chat.summary}</p>
	</Button>
{/each}
