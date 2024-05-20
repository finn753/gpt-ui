<script lang="ts">
	import { cn } from "$lib/utils";
	import { Button } from "$lib/components/ui/button";
	import * as Select from "$lib/components/ui/select";
	import { generationHistory } from "$lib/scripts/misc/stores";
	import * as modelInvoker from "$lib/scripts/api-wrapper/model-invoker";
	import { Textarea } from "$lib/components/ui/textarea";
	import { LoaderCircle } from "lucide-svelte";

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

	let generating = false;

	async function generateVoice() {
		const input = inputValue.trim();
		inputValue = "";

		if (!input) return;

		generating = true;
		const generatedVoice = await modelInvoker.generateVoice(input, voice);
		generating = false;

		if (!generatedVoice) return;

		$generationHistory.voice = [generatedVoice, ...$generationHistory.voice];
	}
</script>

<div class={cn("flex flex-col gap-2 p-4 px-8", className)}>
	<h1 class="text-2xl font-bold">Voice Generator</h1>

	<div class="flex w-full gap-2">
		<Textarea
			class="resize-y"
			placeholder="Enter text to be converted to speech"
			bind:value={inputValue}
		/>
		<Select.Root
			selected={selectionModel}
			onSelectedChange={(v) => {
				v && (voice = String(v.value));
			}}
		>
			<Select.Trigger class="w-48">
				<Select.Value placeholder="Select a voice" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Voices</Select.Label>
					{#each voiceSelection as model}
						<Select.Item value={model.value} label={model.label}>{model.label}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input name="selectedModel" />
		</Select.Root>
		<Button class="h-10" on:click={generateVoice} disabled={generating}>Generate</Button>
	</div>

	{#if generating}
		<div class="size-full p-2">
			<LoaderCircle class="animate-spin opacity-50" size={24} />
		</div>
	{:else if $generationHistory.voice[0]}
		<div class="flex flex-col items-center gap-2">
			<audio class="w-full" controls src={$generationHistory.voice[0]} />
			<Button class="w-full" href={$generationHistory.voice[0]} download>Download</Button>
		</div>
	{/if}
</div>
