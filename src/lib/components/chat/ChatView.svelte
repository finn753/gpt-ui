<script lang="ts">
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
	import type { ChatMessageStructure } from "$lib/scripts/misc/types";
	import ChatMessage from "$lib/components/chat/ChatMessage.svelte";
	import {
		chatContentMap,
		chatDataMap,
		lastLiveDataSourceOutputOfChat,
		newChatSettings
	} from "$lib/scripts/misc/stores";
	import { goto } from "$app/navigation";
	import { tick } from "svelte";
	import { scrollToBottom } from "$lib/utils";
	import chatOperations from "$lib/scripts/chat/chat-operations";
	import chatService from "$lib/scripts/chat/chat-service";
	import { generationHelper } from "$lib/scripts/chat/generation-helper";
	import modelManager from "$lib/scripts/chat/model-manager";
	import ModelTemplateLibrary from "$lib/components/chat/ModelTemplateLibrary.svelte";
	import { Button } from "$lib/components/ui/button";

	export let chatID: string;
	export let generating = false;

	let inputValue = "";
	let currentImageAttachments: File[] = [];

	let scrollContainer: HTMLElement;
	let isUserAtBottomOfScrollContainer = true;

	let messages: ChatMessageStructure[] = [];
	let generatingProgress: ChatMessageStructure[] | null;

	$: isNewChat = !chatID;

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

	$: if (generatingProgress && isUserAtBottomOfScrollContainer) {
		scrollToBottom(scrollContainer);
	}

	async function onSendMessage(event: CustomEvent<{ value: string; images?: File[] }>) {
		generating = true;

		let startedNewChat = false;

		if (isNewChat) {
			const success = await createNewChat();
			if (!success) {
				generating = false;
				return;
			}

			startedNewChat = true;

			$newChatSettings.images = event.detail.images || [];
		}

		inputValue = "";
		currentImageAttachments = event.detail.images || [];

		const attachments = {
			images: currentImageAttachments.map((file) => file.name)
		};

		const success = await chatService.sendUserMessage(chatID, event.detail.value, attachments);

		await scrollToBottom(scrollContainer);

		if (!success) return;

		await generateResponse();

		generating = false;

		if (startedNewChat) {
			$lastLiveDataSourceOutputOfChat[chatID] = $newChatSettings.toolResults || {};
			await goto(`/chats/${chatID}`);
		}

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

		generating = false;
	}

	async function createNewChat() {
		chatID = (await chatOperations.createNewChat()) || "";

		if (!chatID) return false;

		if ($newChatSettings.model) {
			await chatOperations.changeAssistantData(chatID, $newChatSettings.model);
		}

		if ($newChatSettings.tools) {
			await chatOperations.changeTools(chatID, $newChatSettings.tools);
		}

		return true;
	}

	async function generateResponse() {
		let model, temperature, topP, systemMessage, tools;

		try {
			({ model, temperature, topP, systemMessage } = $chatDataMap[chatID].model);
		} catch (e: unknown) {
			console.log("Defaulting to standard assistant model");
		}

		tools = $chatDataMap[chatID].tools || {};

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
			currentImageAttachments,
			tools
		)) {
			response = r;
			generatingProgress = response || null;
		}
		generatingProgress = null;

		if (response) {
			await chatService.sendAssistantMessage(chatID, [...response]);
		}
	}

	async function onEditButtonClick() {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage.role === "user" && lastMessage.id) {
			await chatOperations.deleteMessage(lastMessage.id, chatID);
			inputValue = lastMessage.content;
		}
	}
</script>

<div class="relative flex size-full flex-col px-4 pb-4 md:px-0">
	<div
		class="flex-1 overflow-y-auto"
		bind:this={scrollContainer}
		on:scroll={() => {
			isUserAtBottomOfScrollContainer =
				scrollContainer.scrollTop + scrollContainer.clientHeight + 16 >=
				scrollContainer.scrollHeight;
		}}
	>
		<div class="flex flex-col">
			{#each messages.filter((msg) => msg.content !== "") as message}
				<ChatMessage {message} {chatID} on:retry={onRetrySendMessage} bind:generating />
			{/each}
			{#if generatingProgress}
				{#each generatingProgress as message}
					<ChatMessage {message} {chatID} bind:generating />
				{/each}
			{/if}
		</div>
		{#if messages.length > 0 && !generating}
			<div class="flex w-full items-center justify-center gap-2 p-4">
				{#if messages[messages.length - 1]?.role === "user"}
					<Button variant="glass" on:click={onEditButtonClick}>Edit</Button>
				{/if}
			</div>
		{/if}
	</div>

	{#if isNewChat}
		<ModelTemplateLibrary />
	{/if}

	<ChatInput
		bind:value={inputValue}
		on:submit={onSendMessage}
		{generating}
		canAttachImages={modelManager.getModelInfoById($chatDataMap[chatID]?.model.model)?.vision ||
			modelManager.getModelInfoById($newChatSettings?.model?.model || "")?.vision ||
			false}
	/>
</div>
