<script lang="ts">
	import { cn } from "$lib/utils";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { generationHistory } from "$lib/stores";
	import * as Select from "$lib/components/ui/select";
	import * as modelInvoker from "$lib/modelInvoker";

	let className = "";
	export { className as class };

	let inputValue = "";

	const modelSelection = [
		{ value: "dall-e-2", label: "DALL-E 2" },
		{ value: "dall-e-3", label: "DALL-E 3" }
	];
	let model = modelSelection[0].value;
	let selectionModel: { value: string; label: string } = modelSelection[0];

	async function generateImage() {
		const prompt = inputValue.trim();
		inputValue = "";

		if (!prompt) return;

		const generatedImage = await modelInvoker.generateImage(prompt, model);

		if (!generatedImage) return;

		$generationHistory.images = [generatedImage, ...$generationHistory.images];
	}
</script>

<div class={cn("flex flex-col gap-2 p-4 px-8", className)}>
	<h1 class="text-2xl font-bold">Image Generator</h1>

	<div class="flex w-full gap-2">
		<Input placeholder="Describe the picture you want..." bind:value={inputValue} />
		<Select.Root
			selected={selectionModel}
			onSelectedChange={(v) => {
				v && (model = String(v.value));
			}}
		>
			<Select.Trigger class="w-48">
				<Select.Value placeholder="Select a model" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Models</Select.Label>
					{#each modelSelection as model}
						<Select.Item value={model.value} label={model.label}>{model.label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="selectedModel" />
		</Select.Root>
		<Button class="h-10" on:click={generateImage}>Generate</Button>
	</div>

	{#if $generationHistory.images[0]}
		<div class="flex flex-col items-center gap-2">
			<img
				src="data:image/png;base64,{$generationHistory.images[0].b64_json}"
				alt="Generated output"
				class="size-96 rounded-2lg"
			/>
			<p class="text-sm">{$generationHistory.images[0].revised_prompt || ""}</p>
			<Button
				class="w-full"
				href="data:image/png;base64,{$generationHistory.images[0].b64_json}"
				download>Download</Button
			>
		</div>
	{/if}
</div>
