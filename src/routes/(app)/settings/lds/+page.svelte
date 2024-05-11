<script lang="ts">
	import { tavilyApiKey } from "$lib/scripts/misc/stores";
	import APIKeySettings from "$lib/components/settings/APIKeySettings.svelte";
</script>

<div class="flex flex-col gap-2">
	<h1 class="text-2xl font-bold">Live Data Sources</h1>
	<h2 class="text-lg font-bold">Web Browsing</h2>
	<APIKeySettings label="Tavily" slug="tavily_api_key" apiKeyStore={tavilyApiKey} />
</div>
