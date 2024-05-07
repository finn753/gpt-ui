<script lang="ts">
	import { format } from "date-fns";
	import { Button } from "$lib/components/ui/button";
	import { Clipboard, FastForward, Trash } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import type { ChatMessageStructure } from "$lib/scripts/misc/types";
	import SvelteMarkdown from "svelte-markdown";
	import { createEventDispatcher } from "svelte";
	import * as Accordion from "$lib/components/ui/accordion";
	import chatOperations from "$lib/scripts/chat/chat-operations";
	import chatService from "$lib/scripts/chat/chat-service";
	import { get } from 'svelte/store';
	import { chatContentMap, chatDataMap } from '$lib/scripts/misc/stores';
	import { generationHelper } from '$lib/scripts/chat/generation-helper';
	import database from '$lib/scripts/operations/database';

	const dispatch = createEventDispatcher<{ retry: { message: ChatMessageStructure } }>();

	export let message: ChatMessageStructure;
	export let chatID: string;

	let role: string = "";
	let model: string = "";
	let content: string = "";
	let created_at: Date = new Date(Date.now());
	let failed = false;
	let attachmentCounts: Record<string, number> = {};

	$: {
		role = message.role;
		model = message.model;
		content = message.content;
		created_at = message.created_at;
		failed = message.failed || false;

		if (message.attachments) {
			attachmentCounts = Object.fromEntries(
				Object.entries(message.attachments)
					.filter(([, value]) => Array.isArray(value) && value.length > 0)
					.map(([key, value]) => [key, value.length])
			);
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(content);
		toast.success("Copied to clipboard");
	}

	async function deleteMessage() {
		if (!chatID || !message.id) return console.error("ID is missing");

		if (confirm("Are you sure you want to delete this message?")) {
			await chatOperations.deleteMessage(message.id, chatID);
		}
	}

	async function continueMessage() {
		if (!chatID || !message.id) return console.error("ID is missing");

		const allMessages = get(chatContentMap)[chatID];
		const messageIndex = allMessages.findIndex((msg) => msg.id === message.id);

		if (messageIndex === -1) return;

		const messages = allMessages.slice(0, messageIndex + 1);

		const queryMessage = messages[messages.length - 1];

		if (!queryMessage || queryMessage.role !== "assistant") return;

		const context = await chatService.getContextFromMessages(messages, get(chatDataMap)[chatID].summary);

		const stream = generationHelper.continueResponse(
			context,
			get(chatDataMap)[chatID].model.model,
			{
				temperature: get(chatDataMap)[chatID].model.temperature,
				top_p: get(chatDataMap)[chatID].model.topP
			},
			get(chatDataMap)[chatID].model.systemMessage
		);

		let previousContent = queryMessage.content;
		let newContent = "";

		for await (const part of stream) {
			if (!part) continue;

			newContent = part[0].content;

			message.content = previousContent + "\n" + newContent;
		}
		await database.updateMessage(message.id, message);
	}

	function onRetry() {
		dispatch("retry", { message });
	}
</script>

<div class="group p-4 pb-0">
	<div class="flex flex-row items-center justify-between">
		<h3 class="text-lg font-bold">{role} {model}</h3>
		<p class="ml-2 text-sm text-muted-foreground">{format(created_at, "PP, HH:mm")}</p>
	</div>

	{#if role === "tool"}
		<Accordion.Root>
			<Accordion.Item value="item-1">
				<Accordion.Trigger>Result</Accordion.Trigger>
				<Accordion.Content>
					<p
						class="prose dark:prose-invert prose-h1:text-xl prose-h1:font-bold prose-p:text-justify prose-a:text-blue-600 prose-img:rounded-xl"
					>
						<SvelteMarkdown source={content} />
					</p>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	{:else}
		<p
			class="prose dark:prose-invert prose-h1:text-xl prose-h1:font-bold prose-p:text-justify prose-a:text-blue-600 prose-img:rounded-xl"
		>
			<SvelteMarkdown source={content} />
		</p>
	{/if}

	{#if Object.keys(attachmentCounts).length > 0}
		<div class="mt-2 flex flex-row items-center gap-2">
			{#each Object.entries(attachmentCounts) as [key, value]}
				<p class="text-sm text-muted-foreground">
					{key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}: {value}
				</p>
			{/each}
		</div>
	{/if}

	{#if failed}
		<div class="flex justify-between text-red-500">
			<p>Failed to send message</p>
			<span
				><Button class="text-red-500" variant="link" size="none" on:click={onRetry}>Retry</Button
				></span
			>
		</div>
	{/if}

	<div
		class="flex flex-row items-center gap-2 py-2 opacity-0 transition-opacity group-hover:opacity-100"
	>
		{#if role === "assistant"}
			<Button
				class="p-0 opacity-50 hover:opacity-100"
				variant="icon"
				size="none"
				on:click={continueMessage}><FastForward size={20} /></Button
			>
		{/if}
		<Button
			class="p-0 opacity-50 hover:opacity-100"
			variant="icon"
			size="none"
			on:click={copyToClipboard}><Clipboard size={20} /></Button
		>
		<Button
			class="p-0 opacity-50 hover:opacity-100"
			variant="icon"
			size="none"
			on:click={deleteMessage}><Trash size={20} /></Button
		>
	</div>
</div>
