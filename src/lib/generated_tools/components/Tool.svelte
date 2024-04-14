<script lang="ts">
	import { executeFunction } from "$lib/generated_tools/codeHelper";
	import type { LoadOutput } from "$lib/generated_tools/codeHelper";

	import TextParameter from "$lib/generated_tools/components/inputs/TextParameter.svelte";
	import NumberParameter from "$lib/generated_tools/components/inputs/NumberParameter.svelte";
	import FileParameter from "$lib/generated_tools/components/inputs/FileParameter.svelte";
	import OutputRenderer from "$lib/generated_tools/components/outputs/OutputRenderer.svelte";
	import ColorParameter from "$lib/generated_tools/components/inputs/ColorParameter.svelte";
	import TextArrayParameter from "$lib/generated_tools/components/inputs/TextArrayParameter.svelte";

	export let data: LoadOutput;

	let input: Record<string, any> = {};
	let output: any;

	$: {
		data; // Make reactivity depend on data
		resetInOut();
	}

	$: if (Object.keys(input).length > 0) generateOutput();

	function resetInOut() {
		input = {};
		output = undefined;
	}

	function generateOutput() {
		output = executeFunction(data, input);
	}
</script>

<div class="">
	<h1 class="pb-4 text-3xl font-bold">{data.functionTree[0].name}</h1>
	<div class="flex justify-center space-x-16">
		<div class="">
			<form method="POST" on:submit|preventDefault={generateOutput}>
				<div class="grid min-w-0 auto-cols-auto grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
					{#each data.functionTree[0].parameters as p}
						{#if p.type === "string"}
							{#if p.name.startsWith("color")}
								<ColorParameter
									class="aspect-square max-w-[256px]"
									id={p.name}
									bind:value={input[p.name]}
								/>
							{:else}
								<TextParameter
									class="aspect-square max-w-[256px]"
									id={p.name}
									bind:value={input[p.name]}
								/>
							{/if}
						{/if}

						{#if p.type === "string[]"}
							<TextArrayParameter
								class="aspect-square max-w-[256px]"
								id={p.name}
								bind:value={input[p.name]}
							/>
						{/if}

						{#if p.type === "number"}
							<NumberParameter
								class="aspect-square max-w-[256px]"
								id={p.name}
								bind:value={input[p.name]}
							/>
						{/if}

						{#if p.type === "number[]"}
							<TextArrayParameter
								type="number"
								class="aspect-square max-w-[256px]"
								id={p.name}
								bind:value={input[p.name]}
							/>
						{/if}

						{#if p.type === "File[]"}
							<FileParameter
								class="aspect-square max-w-[256px]"
								id={p.name}
								bind:value={input[p.name]}
							/>
						{/if}
					{/each}
				</div>
			</form>
		</div>
		<div class="">
			<OutputRenderer {data} outputPromise={output} />
		</div>
	</div>
</div>
