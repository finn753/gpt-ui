<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Table from "$lib/components/ui/table";
	import * as Card from "$lib/components/ui/card";
	import database from "$lib/scripts/operations/database";
	import { X } from "lucide-svelte";
	import { userTagMap } from "$lib/scripts/misc/stores";
	import type { TagElement } from "$lib/scripts/misc/types";
	import { Switch } from "$lib/components/ui/switch";

	let addTagInput: string = "";

	async function onAddTagSubmit() {
		const newTagName = addTagInput.replaceAll(" ", "");

		if (newTagName) {
			addTagInput = "";
			await addTag(newTagName);
		}
	}

	async function addTag(name: string) {
		const newTag: TagElement = {
			name,
			hidden: false
		};

		const newTagId = await database.insertTag(newTag);

		if (!newTagId) return;

		userTagMap.update((map) => {
			map[newTagId] = newTag;
			return map;
		});
	}

	async function toogleTagVisibility(id: string) {
		const tag = $userTagMap[id];
		tag.hidden = !tag.hidden;
		await database.updateTag(id, tag);
		userTagMap.update((map) => {
			map[id] = tag;
			return map;
		});
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Tags</Card.Title>
		<Card.Description>Define which tags are available</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Tag</Table.Head>
					<Table.Head>Hidden</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each Object.entries($userTagMap) as [id, tag]}
					<Table.Row>
						<Table.Cell class="font-medium">{tag.name}</Table.Cell>
						<Table.Cell
							><Switch checked={tag.hidden} on:click={() => toogleTagVisibility(id)} /></Table.Cell
						>
						<Table.Cell>
							<Button
								variant="destructive"
								on:click={async () => {
									await database.deleteTag(id);
									userTagMap.update((map) => {
										delete map[id];
										return map;
									});
								}}
							>
								<X />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
		<Input
			bind:value={addTagInput}
			placeholder="Add tag"
			on:keydown={(e) => {
				if (e.key === "Enter") onAddTagSubmit();
			}}
		/>
	</Card.Content>
</Card.Root>
