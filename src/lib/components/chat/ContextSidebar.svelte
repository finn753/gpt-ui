<script lang="ts">
	import type { Message } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import * as Select from "$lib/components/ui/select";
	import * as Card from "$lib/components/ui/card";

	const testModels = [
		{ value: "gpt-3.5-turbo", label: "GPT-3" },
		{ value: "gpt-4-turbo", label: "GPT-4" },
	];

	export let title: string;
	export let summary: string;
	export let tags: string[];
	export let model: {value: string, label: string} = testModels[0];
	// eslint-disable-next-line svelte/valid-compile
	export let contextMessages: Message[];
</script>

<div class="w-full space-y-2">
	<Card.Root>
		<Card.Header>
			<Card.Title>{title}</Card.Title>
			<Card.Description>
				<div class="flex flex-wrap w-full gap-1">
				{#each tags as tag}
					<Badge>{tag}</Badge>
				{/each}
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
							<Select.Item value={model.value} label={model.label}
							>{model.label}</Select.Item
							>
						{/each}
					</Select.Group>
				</Select.Content>
				<Select.Input name="selectedModel" />
			</Select.Root>
		</Card.Footer>
	</Card.Root>
</div>