<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import * as Select from "$lib/components/ui/select";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Pencil, Sparkles, X } from "lucide-svelte";
	import Check from "lucide-svelte/icons/check";
	import { chatContentMap, chatDataMap } from "$lib/stores";
	import { changeAssistantData, changeTitle, generateTitle } from '$lib/helper';
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	const modelSelection = [
		{ value: "", label: "Custom" },
		{ value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
		{ value: "gpt-4-turbo", label: "GPT-4 Turbo" },
	];

	export let supabase: SupabaseClient;

	export let chatID: string | null;

	let title: string = "";
	let summary: string = "";
	let tags: string[] = [];

	let model = modelSelection[1].value;
	let temperature = 0.5;
	let topP = 0.5;
	let systemMessage = "You are a helpful assistant";

	let selectionModel: { value: string; label: string } = modelSelection[1];

	let unsavedAssistantChanges = false;
	$: model, temperature, topP, systemMessage, (unsavedAssistantChanges = true);

	//let contextMessages: MessageStructure[];

	$: chatData = chatID ? $chatDataMap[chatID] : null;
	$: newChat = !chatID;

	$: chatID, chatData, updateData();

	function updateData() {
		title = "";
		summary = "";
		tags = [];

		model = modelSelection[1].value;
		temperature = 0.5;
		topP = 0.5;
		systemMessage = "You are a helpful assistant";

		if (chatData) {
			title = chatData.title;
			summary = chatData.summary;
			tags = chatData.tags;

			if(chatData.model && chatData.model.model && chatData.model.temperature && chatData.model.topP && chatData.model.systemMessage) {
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

	function onAddTagChange() {
		if (addTagInput) {
			//split at space and ,
			let splitTags = addTagInput.split(/[\s,]+/);

			if (splitTags.length > 1 && chatID) {
				let newTags = splitTags.filter((tag) => tag !== "");
				$chatDataMap[chatID].tags = [...tags, ...newTags];

				addTagInput = "";
			}
		}
	}

	function addTag() {
		if (addTagInput && chatID) {
			$chatDataMap[chatID].tags = [...tags, addTagInput];

			addTagInput = "";
		}
	}

	function removeTag(tagToRemove: string) {
		const index = tags.indexOf(tagToRemove);
		if (index !== -1) {
			tags.splice(index, 1);
		}

		tags = tags;
	}

	async function onAcceptTitle() {
		if (chatID && editTitleInput !== title) {
			await changeTitle(chatID, editTitleInput, supabase);
		}

		editingTitle = false;
	}

	async function generateNewTitle() {
		if (chatID) {
			let newTitle = await generateTitle($chatContentMap[chatID]);
			if (newTitle) await changeTitle(chatID, newTitle, supabase);
		}
	}

	async function onSaveAssistant() {
		if (chatID) {
			await changeAssistantData(chatID, {model, temperature, topP, systemMessage}, supabase);
			unsavedAssistantChanges = false;
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
							on:blur={addTag}
							on:keydown={(e) => {
								if (e.key === "Enter") addTag();
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
				<Select.Root selected={selectionModel} onSelectedChange={(v) => { v && (model = v.value)}}>
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
				<Input bind:value={model}/>
			</Label>

			<Label>
				Temperature
				<Input class="w-min" type="number" min="0" max="1" step="0.01" bind:value={temperature} />
			</Label>

			<Label>
				Top-P
				<Input class="w-min" type="number" min="0" max="1" step="0.01" bind:value={topP} />
			</Label>

			<Label>
				System Message
				<Textarea class="w-full resize-none" bind:value={systemMessage} />
			</Label>
		</Card.Content>
		<Card.Footer class="flex justify-end">
			<Button on:click={onSaveAssistant} disabled={!unsavedAssistantChanges}>Save</Button>
		</Card.Footer>
	</Card.Root>
</div>
