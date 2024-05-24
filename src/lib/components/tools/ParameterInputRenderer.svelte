<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import StringParameter from "$lib/components/tools/input-primitives/StringParameter.svelte";
	import NumberParameter from "$lib/components/tools/input-primitives/NumberParameter.svelte";
	import StringArrayParameter from "$lib/components/tools/input-primitives/StringArrayParameter.svelte";

	export let parameters: { name: string; type: string }[];
	export let outputReference: Record<string, string | string[] | number | number[]>;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Parameters</Card.Title>
		<Card.Description>Fill in the parameters for the tool</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		{#each parameters as parameter}
			{#if parameter.type === "string"}
				<StringParameter id={parameter.name} bind:value={outputReference[parameter.name]} />
			{/if}

			{#if parameter.type === "string[]"}
				<StringArrayParameter id={parameter.name} bind:value={outputReference[parameter.name]} />
			{/if}

			{#if parameter.type === "number"}
				<NumberParameter id={parameter.name} bind:value={outputReference[parameter.name]} />
			{/if}
		{/each}
	</Card.Content>
</Card.Root>
