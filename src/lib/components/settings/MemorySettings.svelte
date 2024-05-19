<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import database from "$lib/scripts/operations/database";
	import { Plus, X } from "lucide-svelte";
	import { memoryLDS } from "$lib/scripts/misc/stores";

	let memoryInput: string = "";

	async function addMemory() {
		memoryLDS.update((value) => {
			value.push({ content: memoryInput });
			return value;
		});

		memoryInput = "";

		await database.changeMemoryLDS($memoryLDS);
	}
	async function deleteMemoryAtIndex(index: number) {
		memoryLDS.update((value) => {
			value.splice(index, 1);
			return value;
		});

		await database.changeMemoryLDS($memoryLDS);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Memory</Card.Title>
		<Card.Description>Define things AI should remember about you</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		<div class="flex w-full flex-col gap-1">
			{#each $memoryLDS as memory, index}
				<div class="flex items-center justify-between">
					<p>{memory.content}</p>
					<Button class="size-10" on:click={() => deleteMemoryAtIndex(index)} size="icon"
						><X /></Button
					>
				</div>
			{/each}
		</div>
	</Card.Content>
	<Card.Footer class="gap-2 border-t px-6 py-4">
		<Input
			bind:value={memoryInput}
			placeholder="Add memory"
			on:keydown={(e) => {
				if (e.key === "Enter") addMemory();
			}}
		/>
		<Button class="size-10" on:click={addMemory} size="icon"><Plus /></Button>
	</Card.Footer>
</Card.Root>
