<script lang="ts">
	import type { ChatStructure } from '$lib/types';
	import { Button } from '$lib/components/ui/button';

	export let chatList: ChatStructure[];
</script>

<Button class="w-full" href="/chats">New chat</Button>
{#each chatList as chat}
	<Button variant="ghost" class="flex flex-col w-full" href="/chats/{chat.id}">
		<h2>{chat.title}</h2>
		<p>{chat.summary}</p>
	</Button>
{/each}
