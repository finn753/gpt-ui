<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import * as Select from "$lib/components/ui/select";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Pencil, X } from "lucide-svelte";
	import Check from "lucide-svelte/icons/check";
	import { chatDataMap } from "$lib/stores";

	const testModels = [
		{ value: "gpt-3.5-turbo", label: "GPT-3" },
		{ value: "gpt-4-turbo", label: "GPT-4" }
	];

	export let chatID: string | null;

	let title: string = "";
	let summary: string = "";
	let tags: string[] = [];
	let model: { value: string; label: string } = testModels[0];
	//let contextMessages: MessageStructure[];

	$: chatData = chatID ? $chatDataMap[chatID] : null;

	$: {
		if (chatData) {
			title = chatData.title;
			summary = chatData.summary;
			tags = chatData.tags;
			model = testModels.find((model) => model.value === chatData?.model) || testModels[0];
		} else {
			title = "";
			summary = "";
			tags = [];
			model = testModels[0];
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
				let newTags = splitTags.filter((tag) => tag !== "")
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
</script>

<div class="w-full space-y-2 pb-4">
	<Card.Root class="min-h-0">
		<Card.Header>
			<Card.Title class="flex items-center justify-between gap-2 text-lg tracking-normal">
				{#if !editingTitle}
					{title}
					<Button variant="icon" size="none" on:click={() => (editingTitle = true)}
						><Pencil size={16} /></Button
					>
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
						<Button
							variant="icon"
							size="none"
							on:click={() => {
								title = editTitleInput;
								editingTitle = false;
							}}
						>
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
						class="w-20 bg-background px-2.5 py-0.5 text-xs font-semibold outline-none placeholder:text-muted-foreground"
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
		<Card.Footer>
			<Select.Root selected={model}>
				<Select.Trigger class="w-full">
					<Select.Value placeholder="Select a model" />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Label>Models</Select.Label>
						{#each testModels as model}
							<Select.Item value={model.value} label={model.label}>{model.label}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
				<Select.Input name="selectedModel" />
			</Select.Root>
		</Card.Footer>
	</Card.Root>
</div>
