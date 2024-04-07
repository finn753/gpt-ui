<script lang="ts">
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
	import type { MessageStructure } from "$lib/types";
	import ChatMessage from "$lib/components/chat/ChatMessage.svelte";
	import { chatContentMap, chatDataMap, newChatSettings } from "$lib/stores";
	import {
		createSummary,
		generateResponse,
		generateTitle,
		getContextFromMessages
	} from "$lib/helper";
	import { goto } from "$app/navigation";
	import { tick } from "svelte";
	import { scrollToBottom } from "$lib/utils";
	import { changeAssistantData, changeTitle, createNewChat, sendMessage } from '$lib/chatOperations';

	export let chatID: string;
	export let generating = false;

	let scrollContainer: HTMLElement;

	let messages: MessageStructure[] = [];
	let generatingProgress: MessageStructure | null;

	$: if (chatID && Object.keys($chatContentMap).includes(chatID)) {
		messages = $chatContentMap[chatID];
	} else {
		messages = [];
	}

	$: {
		if (chatID) {
			(async () => {
				await tick();
				await scrollToBottom(scrollContainer, "instant");
			})();
		}
	}

	async function onSendMessage(event: CustomEvent<{ value: string }>) {
		let isNewChat = false;
		if (!chatID) {
			isNewChat = true;
			chatID = await createNewChat() || ""

			if (!chatID) return;
		}

		let newMessage: MessageStructure = {
			content: event.detail.value,
			chat_id: chatID,
			role: "user",
			model: "",
			created_at: new Date(Date.now())
		};

		messages = messages ? [...messages, newMessage] : [newMessage];
		await sendMessage(newMessage, chatID);

		await scrollToBottom(scrollContainer);

		let model, temperature, topP, systemMessage;

		try {
			if (isNewChat && $newChatSettings.model) {
				//$chatDataMap[chat_id].model = $newChatSettings.model;
				await changeAssistantData(chatID, $newChatSettings.model);
			}
			({ model, temperature, topP, systemMessage } = $chatDataMap[chatID].model);
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
			await sendMessage(response, chatID);
		}

		await scrollToBottom(scrollContainer);

		if (isNewChat) await goto(`/chats/${chatID}`);

		if (!$chatDataMap[chatID].title) {
			let newTitle = await generateTitle(messages);
			if (newTitle) await changeTitle(chatID, newTitle);
		}

		if (!$chatDataMap[chatID].summary) {
			await createSummary(chatID);
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
