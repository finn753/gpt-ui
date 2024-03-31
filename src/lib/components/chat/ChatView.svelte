<script lang="ts">
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
	import type { MessageStructure } from "$lib/types";
	import ChatMessage from "$lib/components/chat/ChatMessage.svelte";
	import { chatContentMap } from "$lib/stores";
	import { createNewChat, generateResponse, sendMessage } from "$lib/helper";
	import { goto } from "$app/navigation";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { writable } from "svelte/store";

	export let chat_id: string;
	export let supabase: SupabaseClient;

	let messages: MessageStructure[] = [];
	let generatingProgress = writable<MessageStructure | null>();

	$: if (chat_id && Object.keys($chatContentMap).includes(chat_id)) {
		messages = $chatContentMap[chat_id];
	} else {
		messages = [];
	}
	async function onSendMessage(event: CustomEvent<{ value: string }>) {
		if (!chat_id) {
			chat_id = await createNewChat(supabase);

			if (!chat_id) return;

			await goto(`/chats/${chat_id}`);
		}

		let newMessage: MessageStructure = {
			content: event.detail.value,
			chat_id: chat_id,
			role: "user",
			model: "",
			created_at: new Date(Date.now())
		};

		messages = [...messages, newMessage];
		await sendMessage(newMessage, chat_id, supabase);

		const response = await generateResponse(messages, generatingProgress);
		generatingProgress.set(null);

		if (response) {
			await sendMessage(response, chat_id, supabase);
		}
	}
</script>

<div class="relative flex size-full flex-col px-4 pb-4 md:px-0">
	<div class="flex-1 overflow-y-auto">
		<div class="flex flex-col">
			{#each messages as message}
				<ChatMessage {message} />
			{/each}
			{#if $generatingProgress}
				<ChatMessage message={$generatingProgress} />
			{/if}
		</div>
	</div>
	<ChatInput on:submit={onSendMessage} />
</div>
