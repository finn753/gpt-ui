<script lang="ts">
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
	import type { MessageStructure } from "$lib/types";
	import ChatMessage from "$lib/components/chat/ChatMessage.svelte";
	import { chatContentMap, chatDataMap } from '$lib/stores';
	import { createNewChat } from '$lib/helper';
	import { goto } from '$app/navigation';

	export let chat_id: string;
	let messages: MessageStructure[] = [];

	$: if (chat_id && Object.keys($chatContentMap).includes(chat_id)) {
		messages = $chatContentMap[chat_id];
	} else {
		messages = [];
	}
	async function onSendMessage(event: CustomEvent<{ value: string }>) {
		if(!chat_id) {
			chat_id = await createNewChat()
			await goto(`/chats/${chat_id}`)
			$chatDataMap = $chatDataMap
		}

		let newMessage: MessageStructure = {
			id: "-",
			content: event.detail.value,
			chat_id: chat_id,
			role: "user",
			model: "",
			created_at: new Date(Date.now())
		};

		$chatContentMap[chat_id] = [...messages, newMessage];
	}
</script>

<div class="relative flex size-full flex-col px-4 pb-4 md:px-0">
	<div class="flex-1 overflow-y-auto">
		<div class="flex flex-col">
			{#each messages as message}
				<ChatMessage {message} />
			{/each}
		</div>
	</div>
	<ChatInput on:submit={onSendMessage} />
</div>
