<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { userTagMap } from "$lib/scripts/misc/stores";
	import type { TagElement } from "$lib/scripts/misc/types";
	import { Badge } from "$lib/components/ui/badge";
	import { createEventDispatcher } from "svelte";
	import database from "$lib/scripts/operations/database";

	let inputValue = "";

	$: currentTag = getTagByValue(inputValue);

	const dispatch = createEventDispatcher<{ submit: TagElement }>();

	async function onKeyDown(event: KeyboardEvent) {
		if (event.key === " ") {
			event.preventDefault();
		}

		if (event.key === "Enter") {
			await addTag();
		}
	}

	async function addTag() {
		let newTag = currentTag;
		const newName = inputValue;
		inputValue = "";

		if (!newTag) {
			const tagID = await database.insertTag({ id: -1, name: newName, hidden: false });

			if (!tagID) return;

			newTag = { id: Number(tagID), name: newName, hidden: false };
			$userTagMap[newTag.id] = newTag;
		}

		dispatch("submit", newTag);
	}

	function getTagByValue(value: string): TagElement | undefined {
		return Object.values($userTagMap).find((tag) => {
			return tag.name.toLowerCase() === value.toLowerCase();
		});
	}
</script>

<div class="flex flex-col gap-1">
	<Input bind:value={inputValue} placeholder="Add tag" on:keydown={onKeyDown} />
	{#if inputValue}
		<div class="flex items-center justify-start gap-2 rounded-sm bg-accent p-2 px-4">
			{#if currentTag}
				Add <Badge>{currentTag.name}</Badge>
			{:else}
				Create new tag {inputValue}
			{/if}
		</div>
	{/if}
</div>
