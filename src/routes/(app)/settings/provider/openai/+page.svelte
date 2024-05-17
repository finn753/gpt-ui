<script>
	import { openaiApiKey } from "$lib/scripts/misc/stores";
	import APIKeySettings from "$lib/components/settings/APIKeySettings.svelte";
</script>

<div class="flex flex-col gap-2">
	<h1 class="text-2xl font-bold">OpenAI</h1>

	<APIKeySettings label="API Key" slug="openai_api_key" apiKeyStore={openaiApiKey} />
</div>
