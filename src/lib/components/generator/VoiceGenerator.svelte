<script lang="ts">
	import { cn } from "$lib/utils";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Select from "$lib/components/ui/select";
	import * as generationHelper from "$lib/generationHelper";
	import { generationHistory } from "$lib/stores";

	let className = "";
	export { className as class };

	let inputValue = "";

	const voiceSelection = [
		{ value: "alloy", label: "Alloy" },
		{ value: "echo", label: "Echo" },
		{ value: "fable", label: "Fable" },
		{ value: "onyx", label: "Onyx" },
		{ value: "nova", label: "Nova" },
		{ value: "shimmer", label: "Shimmer" }
	];
	let voice = voiceSelection[0].value;
	let selectionModel: { value: string; label: string } = voiceSelection[0];

	async function generateVoice() {
		const input = inputValue.trim();
		inputValue = "";

		if (!input) return;

		const generatedVoice = await generationHelper.generateVoice(input, voice);

		if (!generatedVoice) return;

		$generationHistory.voice = [generatedVoice, ...$generationHistory.voice];
	}
</script>

<div class={cn("flex flex-col gap-2 p-4 px-8", className)}>
	<h1 class="text-2xl font-bold">Voice Generator</h1>

	<div class="flex w-full gap-2">
		<Input placeholder="Describe the picture you want..." bind:value={inputValue} />
		<Select.Root
			selected={selectionModel}
			onSelectedChange={(v) => {
				v && (voice = String(v.value));
			}}
		>
			<Select.Trigger class="w-48">
				<Select.Value placeholder="Select a model" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Models</Select.Label>
					{#each voiceSelection as model}
						<Select.Item value={model.value} label={model.label}>{model.label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="selectedModel" />
		</Select.Root>
		<Button class="h-10" on:click={generateVoice}>Generate</Button>
	</div>

	{#if $generationHistory.voice[0]}
		<div class="flex flex-col items-center gap-2">
			<audio class="w-full" controls src="data:audio/mpeg;base64,{$generationHistory.voice[0]}" />
			<Button class="w-full" href="data:audio/mpeg;base64,{$generationHistory.voice[0]}" download
				>Download</Button
			>
		</div>
	{/if}
</div>
