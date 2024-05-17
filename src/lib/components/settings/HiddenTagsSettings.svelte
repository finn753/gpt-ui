<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import database from "$lib/scripts/operations/database";
	import { X } from "lucide-svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { hiddenTags } from "$lib/scripts/misc/stores";

	let addTagInput: string = "";
	let tags: string[] = $hiddenTags;

	async function onAddTagChange() {
		if (addTagInput) {
			let splitTags = addTagInput.split(/[\s,]+/); //split at space and ,

			if (splitTags.length > 1) {
				let newTag = splitTags.filter((tag) => tag !== "")[0];
				addTagInput = "";
				await addTag(newTag);
			}
		}
	}

	async function onAddTagSubmit() {
		if (addTagInput) {
			const newTag = addTagInput;
			addTagInput = "";
			await addTag(newTag);
		}
	}

	async function addTag(tag: string) {
		tags = [...tags, tag];
	}

	async function removeTag(tagToRemove: string) {
		const index = tags.indexOf(tagToRemove);
		if (index !== -1) {
			tags.splice(index, 1);
		}

		tags = tags;
	}

	async function saveHiddenTags() {
		const success = await database.changeHiddenTags(tags);

		if (success) hiddenTags.set(tags);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Hidden Tags</Card.Title>
		<Card.Description>
			Define which tags are hidden in the chat list (still accessible via search)
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		<div class="flex w-full flex-wrap gap-1 overflow-x-auto">
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
		</div>
		<Input
			bind:value={addTagInput}
			placeholder="Add tag"
			on:blur={onAddTagSubmit}
			on:keydown={(e) => {
				if (e.key === "Enter") onAddTagSubmit();
			}}
			on:input={onAddTagChange}
		/>
	</Card.Content>
	<Card.Footer class="border-t px-6 py-4">
		<Button class="w-min" on:click={saveHiddenTags}>Save</Button>
	</Card.Footer>
</Card.Root>
