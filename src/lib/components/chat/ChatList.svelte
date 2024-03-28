<script lang="ts">
	import type { ChatDataMap } from '$lib/types';
	import { Button } from '$lib/components/ui/button';

	export let chatMap: ChatDataMap = {};

	$: chats = Array.from(Object.values(chatMap));
</script>

<Button class="w-full" href="/chats">New chat</Button>
{#each chats as chat}
	<Button variant="ghost" class="flex flex-col w-full" href="/chats/{chat.id}">
		<h2>{chat.title}</h2>
		<p>{chat.summary}</p>
	</Button>
{/each}
