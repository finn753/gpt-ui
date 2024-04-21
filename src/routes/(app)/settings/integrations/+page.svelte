<script lang="ts">
	import { openaiApiKey } from "$lib/stores";
	import { tavilyApiKey } from "$lib/stores";
	import APIKeySettings from "$lib/components/settings/APIKeySettings.svelte";
</script>

<div class="flex flex-col gap-2">
	<h1 class="text-2xl font-bold">Integrations</h1>
	<h2 class="text-lg font-bold">API Keys</h2>

	<div class="flex flex-col gap-8">
		<APIKeySettings label="OpenAI" slug="openai_api_key" apiKeyStore={openaiApiKey} />
		<APIKeySettings label="Tavily" slug="tavily_api_key" apiKeyStore={tavilyApiKey} />
	</div>
</div>
