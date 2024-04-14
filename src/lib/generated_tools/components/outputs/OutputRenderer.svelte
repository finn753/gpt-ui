<!--suppress ES6UnusedImports -->
<script lang="ts">
	import type { LoadOutput } from "$lib/generated_tools/codeHelper";
	import FileDownloader from "$lib/generated_tools/components/outputs/FileDownloader.svelte";
	import * as Card from "$lib/components/ui/card";

	export let data: LoadOutput;
	export let outputPromise: Promise<any>;

	let output: any;

	async function fetchOutput() {
		let keyName = Object.keys(data.functionTree[0].outputRenderTypeObject)[0];
		let keyList = Object.keys(data.functionTree[0].outputRenderTypeObject);

		output = { [keyName]: output || null };

		if (Object.keys(keyList).length > 0) {
			output = Object.fromEntries(keyList.map((key) => [key, null]));
		}

		let rawOutput = await outputPromise;

		if (typeof rawOutput === "object") {
			if (Array.isArray(rawOutput)) {
				output = { [keyName]: rawOutput };
			} else if (Object.keys(rawOutput).length > 0) {
				output = rawOutput;
			}
		}
	}

	function getFileCount(file: File | File[]): number {
		if (Array.isArray(file)) {
			return file.length;
		} else if (file === null || file === undefined) {
			return 0;
		} else {
			return 1;
		}
	}

	$: outputPromise, fetchOutput();
</script>

<div class="grid min-w-0 auto-cols-auto grid-cols-1 gap-4 lg:grid-cols-2">
	{#each Object.entries(data.functionTree[0].outputRenderTypeObject) as [key, value]}
		<Card.Root class="aspect-square size-[256px] overflow-y-auto">
			<Card.Header>
				<Card.Title>{key}</Card.Title>
				<Card.Description>{value}</Card.Description>
			</Card.Header>
			<Card.Content class="overflow-y-auto">
				{#if value === "string" || value === "number"}
					<p class="min-h-0 overflow-y-auto break-words">
						{output[key]}
					</p>
				{/if}

				{#if value === "string[]"}
					<p class="min-h-0 overflow-y-auto break-words">
						{output[key]}
					</p>
				{/if}

				{#if value === "File[]" || value === "File"}
					<p>{"Files: " + getFileCount(output[key])}</p>
					<FileDownloader files={output[key]} />
				{/if}
			</Card.Content>
		</Card.Root>
	{/each}
</div>
