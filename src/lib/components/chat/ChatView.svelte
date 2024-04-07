<script lang="ts">
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
	import type { MessageStructure } from "$lib/types";
	import ChatMessage from "$lib/components/chat/ChatMessage.svelte";
	import { chatContentMap, chatDataMap, newChatSettings } from "$lib/stores";
	import {
		changeAssistantData,
		changeTitle,
		createNewChat,
		createSummary,
		generateResponse,
		generateTitle,
		getContextFromMessages,
		sendMessage
	} from "$lib/helper";
	import { goto } from "$app/navigation";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { tick } from "svelte";
	import { scrollToBottom } from "$lib/utils";

	export let chat_id: string;
	export let generating = false;
	export let supabase: SupabaseClient;

	let scrollContainer: HTMLElement;

	let messages: MessageStructure[] = [];
	let generatingProgress: MessageStructure | null;

	$: if (chat_id && Object.keys($chatContentMap).includes(chat_id)) {
		messages = $chatContentMap[chat_id];
	} else {
		messages = [];
	}

	$: {
		if (chat_id) {
			(async () => {
				await tick();
				await scrollToBottom(scrollContainer, "instant");
			})();
		}
	}

	async function onSendMessage(event: CustomEvent<{ value: string }>) {
		let isNewChat = false;
		if (!chat_id) {
			isNewChat = true;
			chat_id = await createNewChat(supabase);

			if (!chat_id) return;
		}

		let newMessage: MessageStructure = {
			content: event.detail.value,
			chat_id: chat_id,
			role: "user",
			model: "",
			created_at: new Date(Date.now())
		};

		messages = messages ? [...messages, newMessage] : [newMessage];
		await sendMessage(newMessage, chat_id, supabase);

		await scrollToBottom(scrollContainer);

		let model, temperature, topP, systemMessage;

		try {
			if (isNewChat && $newChatSettings.model) {
				//$chatDataMap[chat_id].model = $newChatSettings.model;
				await changeAssistantData(chat_id, $newChatSettings.model, supabase);
			}
			({ model, temperature, topP, systemMessage } = $chatDataMap[chat_id].model);
		} catch (e: unknown) {
			console.log("Defaulting to standard assistant model");
		}

		let context = messages;
		try {
			context = await getContextFromMessages(messages);
		} catch (e: unknown) {
			console.error("Failed to get context from messages", e);
		}

		generating = true;
		let response: MessageStructure | undefined;
		for await (const r of generateResponse(context, model, temperature, topP, systemMessage)) {
			response = r;
			generatingProgress = response || null;
		}
		generatingProgress = null;
		generating = false;

		if (response) {
			await sendMessage(response, chat_id, supabase);
		}

		await scrollToBottom(scrollContainer);

		if (isNewChat) await goto(`/chats/${chat_id}`);

		if (!$chatDataMap[chat_id].title) {
			let newTitle = await generateTitle(messages);
			if (newTitle) await changeTitle(chat_id, newTitle, supabase);
		}

		if (!$chatDataMap[chat_id].summary) {
			await createSummary(chat_id, supabase);
		}
	}
</script>

<div class="relative flex size-full flex-col px-4 pb-4 md:px-0">
	<div class="flex-1 overflow-y-auto" bind:this={scrollContainer}>
		<div class="flex flex-col">
			{#each messages as message}
				<ChatMessage {message} />
			{/each}
			{#if generatingProgress}
				<ChatMessage message={generatingProgress} />
			{/if}
		</div>
	</div>
	<ChatInput on:submit={onSendMessage} {generating} />
</div>
