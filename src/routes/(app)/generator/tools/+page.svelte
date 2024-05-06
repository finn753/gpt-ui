<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import type { LoadOutput } from "$lib/generated_tools/codeHelper";

	import * as toolGenerator from "$lib/generated_tools/toolGenerator";
	import * as codeHelper from "$lib/generated_tools/codeHelper";
	import Tool from "$lib/generated_tools/components/Tool.svelte";

	let inputValue = "";
	let toolData: LoadOutput;

	async function onGenerate() {
		const prompt = inputValue.trim();
		inputValue = "";

		const tsCode = await toolGenerator.generateTool(prompt);
		toolData = codeHelper.getToolDataFromTsCode(tsCode);
	}
</script>

<div class="flex flex-col gap-2 p-4 px-8">
	<h1 class="text-2xl font-bold">Generated Tools</h1>

	<div class="flex w-full gap-2">
		<Input placeholder="Describe the tool you want..." bind:value={inputValue} />
		<Button class="h-10" on:click={onGenerate}>Generate</Button>
	</div>

	{#if toolData}
		<Tool data={toolData} />
	{/if}
</div>
