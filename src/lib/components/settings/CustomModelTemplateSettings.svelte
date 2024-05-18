<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { customModelTemplates } from "$lib/scripts/misc/stores";
	import { removeCustomModelTemplateAtIndex } from "$lib/scripts/misc/model-templates";

	async function deleteTemplate(index: number) {
		if (confirm("Are you sure you want to delete this template?")) {
			await removeCustomModelTemplateAtIndex(index);
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Custom Model Templates</Card.Title>
		<Card.Description>Manage your templates here</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		{#each $customModelTemplates as template, index}
			<div class="flex justify-between">
				<p>{template.name}</p>
				<Button variant="destructive" on:click={() => deleteTemplate(index)}>Delete</Button>
			</div>
		{/each}
		{#if $customModelTemplates.length === 0}
			<p class="text-muted-foreground">No custom model templates</p>
		{/if}
	</Card.Content>
</Card.Root>
