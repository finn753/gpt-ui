<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import * as Select from "$lib/components/ui/select";
	import { Plus } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import { availableModels, newChatSettings } from "$lib/scripts/misc/stores";
	import { liveDataSourceMap } from "$lib/scripts/chat/live-data-sources";
	import { Switch } from "$lib/components/ui/switch";
	import { addCustomModelTemplate, type ModelTemplate } from "$lib/scripts/misc/model-templates";

	$: modelSelection = $availableModels.map((model) => ({
		value: model.id,
		label: model.name
	}));

	let name: string = "";
	let description: string = "";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let selectedModel: any;
	let model = "";
	let temperature = 0.5;
	let topP = 0.5;
	let systemMessage = "You are a helpful assistant";

	let tools: Record<string, object> = {};

	$: selectedModel = modelSelection.find((m) => m.value === model) || null;

	$: if ($newChatSettings.tools) {
		tools = $newChatSettings.tools;
	}

	$: if ($newChatSettings.model) {
		model = $newChatSettings.model.model;
		temperature = $newChatSettings.model.temperature;
		topP = $newChatSettings.model.topP;
		systemMessage = $newChatSettings.model.systemMessage;
	}

	async function onToolToggle(toolKey: string) {
		if (tools[toolKey]) {
			delete tools[toolKey];
		} else {
			tools[toolKey] = { enabled: true };
		}
	}

	async function saveModelTemplate() {
		const template: ModelTemplate = {
			name: name || "Untitled",
			description: description || "No description",
			settings: {
				modelIDs: [model],
				temperature: temperature,
				topP: topP,
				systemMessage: systemMessage
			},
			tools: tools
		};

		await addCustomModelTemplate(template);
	}
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder
		><Button builders={[builder]} variant="glass" size="none" class="p-4">
			<Plus />
		</Button></AlertDialog.Trigger
	>
	<AlertDialog.Content class="h-[80%]">
		<AlertDialog.Header>
			<AlertDialog.Title>New Model Template</AlertDialog.Title>
			<AlertDialog.Description>Create a new model template</AlertDialog.Description>
		</AlertDialog.Header>

		<div class="h-full space-y-4 overflow-y-auto">
			<div class="flex flex-col gap-4">
				<Label>
					Name
					<Input placeholder="Untitled" bind:value={name} />
				</Label>
				<Label>
					Description
					<Textarea class="resize-y" placeholder="Write a description" bind:value={description} />
				</Label>
			</div>

			<div class="space-y-2">
				<h3 class="text-lg font-semibold">Model</h3>
				<div class="flex flex-col gap-4">
					{#if modelSelection}
						<Label>
							<Select.Root
								selected={selectedModel}
								onSelectedChange={async (v) => {
									if (v) {
										model = String(v.value);
									}
								}}
							>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Select a model" />
								</Select.Trigger>
								<Select.Content class="max-h-64 overflow-y-auto">
									<Select.Group>
										<Select.Label>Models</Select.Label>
										{#each modelSelection as model}
											<Select.Item value={model.value} label={model.label}
												>{model.label}</Select.Item
											>
										{/each}
									</Select.Group>
								</Select.Content>
								<Select.Input name="selectedModel" />
							</Select.Root>
							<Input class="hidden" bind:value={model} />
						</Label>
					{/if}

					<div class="flex gap-4">
						<Label>
							Temperature
							<Input
								class="w-min"
								type="number"
								min="0"
								max="1"
								step="0.01"
								bind:value={temperature}
							/>
						</Label>

						<Label>
							Top-P
							<Input class="w-min" type="number" min="0" max="1" step="0.01" bind:value={topP} />
						</Label>
					</div>

					<Label>
						System Message
						<Textarea class="w-full resize-y" bind:value={systemMessage} />
					</Label>
				</div>
			</div>

			<div class="space-y-2">
				<h3 class="text-lg font-semibold">Tools</h3>
				<div class="flex flex-col gap-4">
					{#each Object.entries(liveDataSourceMap) as [key, liveDataSource]}
						<Label>
							{liveDataSource.name}
							<Switch
								checked={key in tools}
								on:click={() => {
									onToolToggle(key);
								}}
							/>
						</Label>
					{/each}
				</div>
			</div>
		</div>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={saveModelTemplate}>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
