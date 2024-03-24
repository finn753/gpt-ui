<script lang="ts">
	import type { Message } from "$lib/types";
	import { Badge } from "$lib/components/ui/badge";
	import * as Select from "$lib/components/ui/select";
	import * as Card from "$lib/components/ui/card";
	import { Button } from '$lib/components/ui/button';
	import { X } from 'lucide-svelte';

	const testModels = [
		{ value: "gpt-3.5-turbo", label: "GPT-3" },
		{ value: "gpt-4-turbo", label: "GPT-4" }
	];

	export let title: string;
	export let summary: string;
	export let tags: string[];
	export let model: { value: string; label: string } = testModels[0];
	// eslint-disable-next-line svelte/valid-compile
	export let contextMessages: Message[];

	let addTagInput = "";

	$: if(addTagInput) {
		//split at space and any punctioation
		let splitTags = addTagInput.split(/[\s,]+/)

		if(splitTags.length > 1) {
			tags = [...tags, ...splitTags.filter(tag => tag !== "")];
			addTagInput = "";
		}
	}
	
	function addTag() {
		if (addTagInput) {
			tags = [...tags, addTagInput];
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

<div class="w-full space-y-2">
	<Card.Root>
		<Card.Header>
			<Card.Title>{title}</Card.Title>
			<Card.Description>
				<div class="flex w-full flex-wrap gap-1">
					{#each tags as tag}
						<Badge>{tag} <Button class="pl-1" variant="icon" size="none" on:click={() => {removeTag(tag)}}><X size={16}/></Button></Badge>
					{/each}
					<input bind:value={addTagInput} class="w-16 px-2.5 py-0.5 text-xs font-semibold bg-background outline-none placeholder:text-muted-foreground" placeholder="Add tag" on:blur={addTag} on:keydown={(e) => {if (e.key === 'Enter') addTag()}}/>
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
