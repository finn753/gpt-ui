<script lang="ts">
	import {
		availableModels,
		currentModelTemplate,
		customModelTemplates,
		newChatSettings
	} from "$lib/scripts/misc/stores";
	import { type ModelTemplate, defaultModelTemplates } from "$lib/scripts/misc/model-templates";
	import { Button } from "$lib/components/ui/button";
	import AlertAddCustomModelTemplate from "$lib/components/chat/AlertAddCustomModelTemplate.svelte";

	function setNewChatSettings(template: ModelTemplate) {
		if (!$newChatSettings.model) return;

		for (const modelID of template.settings.modelIDs) {
			if ($availableModels.find((model) => model.id === modelID) && $newChatSettings.model) {
				$newChatSettings.model.model = modelID;
				break;
			}
		}

		$newChatSettings.model.systemMessage = template.settings.systemMessage;
		$newChatSettings.model.temperature = template.settings.temperature;
		$newChatSettings.model.topP = template.settings.topP;

		$newChatSettings.tools = template.tools;

		$currentModelTemplate = template.name;
	}

	function isSelected(template: ModelTemplate) {
		if (!$newChatSettings.model) return false;

		if (!template.settings.modelIDs.includes($newChatSettings.model.model)) return false;

		if ($newChatSettings.model.systemMessage !== template.settings.systemMessage) return false;

		if ($newChatSettings.model.temperature !== template.settings.temperature) return false;

		if ($newChatSettings.model.topP !== template.settings.topP) return false;

		return $currentModelTemplate === template.name;
	}
</script>

{#key $newChatSettings}
	<div
		class="flex size-full flex-col items-center justify-center gap-2 overflow-y-auto py-2 lg:p-4"
	>
		<h2 class="text-2xl font-bold">Templates</h2>
		<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
			{#each [...defaultModelTemplates, ...$customModelTemplates] as modelTemplate}
				<Button
					variant={isSelected(modelTemplate) ? "default" : "glass"}
					size="none"
					class="p-4"
					on:click={() => setNewChatSettings(modelTemplate)}
				>
					<div class="flex flex-col">
						<h3 class="text-xl">{modelTemplate.name}</h3>
						<p class="text-wrap break-words opacity-75">{modelTemplate.description}</p>
					</div>
				</Button>
			{/each}
			<AlertAddCustomModelTemplate></AlertAddCustomModelTemplate>
		</div>
	</div>
{/key}
