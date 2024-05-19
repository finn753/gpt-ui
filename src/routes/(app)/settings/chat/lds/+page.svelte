<script lang="ts">
	import { tavilyApiKey } from "$lib/scripts/misc/stores";
	import APIKeySettings from "$lib/components/settings/APIKeySettings.svelte";
	import MemorySettings from "$lib/components/settings/MemorySettings.svelte";
</script>

<div class="flex flex-col gap-2">
	<h1 class="text-2xl font-bold">Live Data Sources</h1>
	<APIKeySettings
		label="Web Browsing: Tavily API Key"
		slug="tavily_api_key"
		apiKeyStore={tavilyApiKey}
	/>
	<MemorySettings />
</div>
