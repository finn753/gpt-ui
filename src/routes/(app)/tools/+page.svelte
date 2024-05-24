<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { generateTool } from "$lib/scripts/tools/tool-generation";
	import {
		compileToJS,
		executeFunction,
		extractFunctionInfo
	} from "$lib/scripts/tools/code-helper";
	import ObjectRenderer from "$lib/components/tools/ObjectRenderer.svelte";
	import ParameterInputRenderer from "$lib/components/tools/ParameterInputRenderer.svelte";
	import * as Card from "$lib/components/ui/card";
	import { handleError } from "$lib/scripts/operations/error-handler";

	let inputValue = "";
	let toolInput: Record<string, string | string[] | number | number[]> = {};

	let toolCode = "";

	$: jsCode = compileToJS(toolCode);
	$: functionTree = extractFunctionInfo(toolCode);
	$: functionOutputPromise = executeFunction(jsCode, functionTree[0], toolInput);

	async function onSubmit() {
		const generatedTool = generateTool(inputValue);
		inputValue = "";

		try {
			toolCode = (await generatedTool) || "";
		} catch (error) {
			handleError("Failed to generate tool code", error);
		}
	}
</script>

<div class="flex h-full w-full flex-col items-center gap-2 p-16">
	<div class="flex w-full max-w-screen-sm flex-col items-center gap-4">
		<h1 class="text-4xl font-bold">Tool Generator</h1>
		<div class="flex w-full items-center justify-center gap-2">
			<Input
				class="h-12 max-w-screen-sm rounded-xl text-lg"
				placeholder="I want a tool that..."
				bind:value={inputValue}
			/>
			<Button variant="glass" class="h-12 rounded-xl" on:click={onSubmit}>Generate</Button>
		</div>
	</div>

	{#if toolCode}
		<div class="grid w-full max-w-screen-sm grid-cols-2 gap-2">
			<ParameterInputRenderer
				parameters={functionTree[0].parameters}
				bind:outputReference={toolInput}
			/>

			<Card.Root>
				<Card.Header>
					<Card.Title>Output</Card.Title>
					<Card.Description>Output of the tool</Card.Description>
				</Card.Header>
				<Card.Content>
					{#await functionOutputPromise then output}
						<ObjectRenderer data={output} />
					{:catch error}
						<p>{error.message}</p>
					{/await}
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</div>
