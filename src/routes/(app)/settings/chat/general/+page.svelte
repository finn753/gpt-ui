<script lang="ts">
	import HiddenTagsSettings from "$lib/components/settings/HiddenTagsSettings.svelte";
	import TagSettings from "$lib/components/settings/TagSettings.svelte";
</script>

<div class="flex flex-col gap-2">
	<h1 class="text-2xl font-bold">General</h1>
	<TagSettings />
	<HiddenTagsSettings />
</div>
