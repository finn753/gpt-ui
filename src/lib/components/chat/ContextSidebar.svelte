<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import * as Select from "$lib/components/ui/select";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Pencil, Sparkles, X } from "lucide-svelte";
	import Check from "lucide-svelte/icons/check";
	import { chatDataMap, lastContextOfChat, newChatSettings } from "$lib/stores";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { changeAssistantData, changeTags, changeTitle } from "$lib/chatOperations";
	import * as chatService from "$lib/chatService";

	const modelSelection = [
		{ value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
		{ value: "gpt-4-turbo", label: "GPT-4 Turbo" }
	];

	export let chatID: string | null;

	let title: string = "";
	let summary: string = "";
	let tags: string[] = [];

	let model = modelSelection[1].value;
	let temperature = 0.5;
	let topP = 0.5;
	let systemMessage = "You are a helpful assistant";

	let selectionModel: { value: string; label: string } = modelSelection[1];

	$: model, temperature, topP, systemMessage;

	$: chatData = chatID ? $chatDataMap[chatID] : null;
	$: newChat = !chatID;

	$: if (newChat) {
		$newChatSettings.model = { model, temperature, topP, systemMessage };
	}

	$: chatID, chatData, updateData();

	function updateData() {
		title = "";
		summary = "";
		tags = [];

		model = modelSelection[1].value;
		temperature = 0.5;
		topP = 0.5;
		systemMessage = "You are a helpful assistant";

		$newChatSettings.model = { model, systemMessage, temperature, topP };

		if (chatData) {
			title = chatData.title;
			summary = chatData.summary;
			tags = chatData.tags;

			if (
				chatData.model &&
				chatData.model.model &&
				chatData.model.temperature &&
				chatData.model.topP &&
				chatData.model.systemMessage
			) {
				model = chatData.model.model;
				temperature = chatData.model.temperature;
				topP = chatData.model.topP;
				systemMessage = chatData.model.systemMessage;
			}
		}
	}

	let addTagInput = "";
	let editingTitle = false;
	let editTitleInput = "";
	$: editTitleInput = title;

	async function onAddTagChange() {
		if (addTagInput) {
			let splitTags = addTagInput.split(/[\s,]+/); //split at space and ,

			if (splitTags.length > 1 && chatID) {
				let newTag = splitTags.filter((tag) => tag !== "")[0];
				addTagInput = "";
				await addTag(newTag);
			}
		}
	}

	async function onAddTagSubmit() {
		if (addTagInput && chatID) {
			const newTag = addTagInput;
			addTagInput = "";
			await addTag(newTag);
		}
	}

	async function addTag(tag: string) {
		tags = [...tags, tag];
		await saveTags();
	}

	async function removeTag(tagToRemove: string) {
		const index = tags.indexOf(tagToRemove);
		if (index !== -1) {
			tags.splice(index, 1);
		}

		await saveTags();
	}

	async function onAcceptTitle() {
		if (chatID && editTitleInput !== title) {
			await changeTitle(chatID, editTitleInput);
		}

		editingTitle = false;
	}

	async function generateNewTitle() {
		if (chatID) {
			await chatService.setGeneratedTitleForChat(chatID);
		}
	}

	async function onSaveAssistant() {
		if (chatID) {
			await changeAssistantData(chatID, { model, temperature, topP, systemMessage });
		}
	}

	async function saveTags() {
		if (chatID) {
			await changeTags(chatID, tags);
		}
	}
</script>

<div class="w-full space-y-2 pb-4">
	{#if !newChat}
		<Card.Root class="min-h-0">
			<Card.Header>
				<Card.Title class="flex justify-between gap-2 text-lg tracking-normal">
					{#if !editingTitle}
						<h3 class="">{title}</h3>
						<div class="min-w-fit space-x-2">
							<Button variant="icon" size="none" on:click={() => (editingTitle = true)}>
								<Pencil size={16} />
							</Button>
							<Button variant="icon" size="none" on:click={generateNewTitle}>
								<Sparkles size={16} />
							</Button>
						</div>
					{:else}
						<!-- svelte-ignore a11y-autofocus -->
						<input
							class="flex w-full bg-background outline-none"
							bind:value={editTitleInput}
							autofocus
						/>
						<div class="flex min-w-10 items-center justify-between">
							<Button
								variant="icon"
								size="none"
								on:click={() => {
									editTitleInput = title;
									editingTitle = false;
								}}
							>
								<X size={16} />
							</Button>
							<Button variant="icon" size="none" on:click={onAcceptTitle}>
								<Check size={16} />
							</Button>
						</div>
					{/if}
				</Card.Title>
				<Card.Description>
					<div class="flex w-full flex-wrap gap-1">
						{#each tags as tag}
							<Badge
								>{tag}
								<Button
									class="pl-1"
									variant="icon"
									size="none"
									on:click={() => {
										removeTag(tag);
									}}><X size={16} /></Button
								></Badge
							>
						{/each}
						<input
							bind:value={addTagInput}
							class="w-20 bg-background px-2.5 py-0.5 text-xs font-semibold outline-none placeholder:text-muted-foreground
						{tags.length === 0 ? 'pl-0' : ''}"
							placeholder="Add tag"
							on:blur={onAddTagSubmit}
							on:keydown={(e) => {
								if (e.key === "Enter") onAddTagSubmit();
							}}
							on:input={onAddTagChange}
						/>
					</div>
				</Card.Description>
			</Card.Header>
			<Card.Content>
				{summary}
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root class="min-h-0">
		<Card.Header>
			<Card.Title>Assistant</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<Label>
				Model
				<Select.Root
					selected={selectionModel}
					onSelectedChange={async (v) => {
						if(v) {
							model = String(v.value);
							await onSaveAssistant();
						}
					}}
				>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a model" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Models</Select.Label>
							{#each modelSelection as model}
								<Select.Item value={model.value} label={model.label}>{model.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
					<Select.Input name="selectedModel" />
				</Select.Root>
				<Input class="hidden" bind:value={model} />
			</Label>

			<Label>
				Temperature
				<Input class="w-min" type="number" min="0" max="1" step="0.01" bind:value={temperature} on:blur={onSaveAssistant}/>
			</Label>

			<Label>
				Top-P
				<Input class="w-min" type="number" min="0" max="1" step="0.01" bind:value={topP} on:blur={onSaveAssistant} />
			</Label>

			<Label>
				System Message
				<Textarea class="w-full resize-none" bind:value={systemMessage} on:blur={onSaveAssistant} />
			</Label>
		</Card.Content>
	</Card.Root>

	{#if chatID}
		<Card.Root class="min-h-0">
			<Card.Header>
				<Card.Title>Context</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				{#if !$lastContextOfChat[chatID]}
					<p>No context available</p>
				{:else}
					{#each $lastContextOfChat[chatID] as message}
						<p>{message.content}</p>
					{/each}
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
