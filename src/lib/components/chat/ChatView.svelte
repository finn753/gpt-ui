<script lang="ts">
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
	import type { ChatMessageStructure } from "$lib/types";
	import ChatMessage from "$lib/components/chat/ChatMessage.svelte";
	import { chatContentMap, chatDataMap, newChatSettings } from "$lib/stores";
	import { goto } from "$app/navigation";
	import { tick } from "svelte";
	import { scrollToBottom } from "$lib/utils";
	import chatOperations from "$lib/chatOperations";
	import chatService from "$lib/chatService";
	import { generationHelper } from "$lib/generationHelper";
	import modelManager from "$lib/modelManager";

	export let chatID: string;
	export let generating = false;

	let inputValue = "";
	let currentImageAttachments: File[] = [];

	let scrollContainer: HTMLElement;

	let messages: ChatMessageStructure[] = [];
	let generatingProgress: ChatMessageStructure[] | null;

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

	async function onSendMessage(event: CustomEvent<{ value: string; images?: File[] }>) {
		generating = true;

		let isNewChat = !chatID;

		if (isNewChat) {
			const success = await createNewChat();
			if (!success) {
				generating = false;
				return;
			}
		}

		inputValue = "";
		currentImageAttachments = event.detail.images || [];

		const success = await chatService.sendUserMessage(chatID, event.detail.value);

		await scrollToBottom(scrollContainer);

		if (!success) return;

		await generateResponse();
		await scrollToBottom(scrollContainer);

		generating = false;

		if (isNewChat) await goto(`/chats/${chatID}`);

		if (!$chatDataMap[chatID].title) {
			await chatService.setGeneratedTitleForChat(chatID);
		}
		await chatService.updateSummaryForChat(chatID);
	}

	async function onRetrySendMessage(event: CustomEvent<{ message: ChatMessageStructure }>) {
		const { message } = event.detail;

		const success = await chatOperations.retrySendMessage(message, chatID);

		if (!success || message.role === "assistant") return;

		await generateResponse();
		await scrollToBottom(scrollContainer);

		generating = false;
	}

	async function createNewChat() {
		chatID = (await chatOperations.createNewChat()) || "";

		if (!chatID) return false;

		if ($newChatSettings.model) {
			await chatOperations.changeAssistantData(chatID, $newChatSettings.model);
		}

		return true;
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
			context = await chatService.getContextFromMessages(messages, $chatDataMap[chatID].summary);
		} catch (e: unknown) {
			console.error("Failed to get context from messages", e);
		}

		let response: ChatMessageStructure[] | undefined;
		for await (const r of generationHelper.generateResponse(
			context,
			model || "",
			{
				temperature,
				top_p: topP
			},
			systemMessage,
			currentImageAttachments
		)) {
			response = r;
			generatingProgress = response || null;
		}
		generatingProgress = null;

		if (response) {
			await chatService.sendAssistantMessage(chatID, [...response]);
		}
	}
</script>

<div class="relative flex size-full flex-col px-4 pb-4 md:px-0">
	<div class="flex-1 overflow-y-auto" bind:this={scrollContainer}>
		<div class="flex flex-col">
			{#each messages.filter((msg) => msg.content !== "") as message}
				<ChatMessage {message} {chatID} on:retry={onRetrySendMessage} />
			{/each}
			{#if generatingProgress}
				{#each generatingProgress as message}
					<ChatMessage {message} {chatID} />
				{/each}
			{/if}
		</div>
	</div>
	<ChatInput
		bind:value={inputValue}
		on:submit={onSendMessage}
		{generating}
		canAttachImages={modelManager.getModelInfoById($chatDataMap[chatID]?.model.model)?.vision ||
			modelManager.getModelInfoById($newChatSettings?.model?.model || "")?.vision ||
			false}
	/>
</div>
