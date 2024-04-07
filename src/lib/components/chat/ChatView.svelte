<script lang="ts">
	import ChatInput from '$lib/components/chat/ChatInput.svelte';
	import type { MessageStructure } from '$lib/types';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import { chatContentMap, chatDataMap, newChatSettings } from '$lib/stores';
	import * as helper from '$lib/helper';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { scrollToBottom } from '$lib/utils';
	import * as chatOperations from '$lib/chatOperations';
	import * as chatService from '$lib/chatService';
	import * as generationHelper from '$lib/generationHelper';

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
		let isNewChat = !chatID;

		if (isNewChat) {
			await createNewChat();
		}

		await chatService.sendUserMessage(chatID, event.detail.value);
		await scrollToBottom(scrollContainer);

		await generateResponse();
		await scrollToBottom(scrollContainer);

		if (isNewChat) await goto(`/chats/${chatID}`);

		if (!$chatDataMap[chatID].title) {
			await chatService.setGeneratedTitleForChat(chatID);
		}
		await chatService.updateSummaryForChat(chatID);
	}

	async function createNewChat() {
		chatID = (await chatOperations.createNewChat()) || "";

		if (!chatID) return;

		if ($newChatSettings.model) {
			await chatOperations.changeAssistantData(chatID, $newChatSettings.model);
		}
	}

	async function generateResponse() {
		let model, temperature, topP, systemMessage;

		try {
			({ model, temperature, topP, systemMessage } = $chatDataMap[chatID].model);
		} catch (e: unknown) {
			console.log("Defaulting to standard assistant model");
		}

		let context = messages;
		try {
			context = await helper.getContextFromMessages(messages);
		} catch (e: unknown) {
			console.error("Failed to get context from messages", e);
		}

		generating = true;
		let response: MessageStructure | undefined;
		for await (const r of generationHelper.generateResponse(
			context,
			model,
			temperature,
			topP,
			systemMessage
		)) {
			response = r;
			generatingProgress = response || null;
		}
		generatingProgress = null;
		generating = false;

		if (response) {
			await chatOperations.sendMessage(response, chatID);
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
