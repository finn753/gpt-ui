<script lang="ts">
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { type Writable } from "svelte/store";
	import database from "$lib/database";

	export let apiKeyStore: Writable<string | null>;
	export let label: string;
	export let slug: string;

	let inputValue = $apiKeyStore;

	async function saveApiKey() {
		const success = await database.changeApiKey(slug, inputValue || "");

		if (success) apiKeyStore.set(inputValue);
	}
</script>

<div class="flex flex-col gap-2">
	<Label>
		<h3 class="text-lg">{label}</h3>
		<Input type="password" class="max-w-sm" placeholder="Your API key..." bind:value={inputValue} />
	</Label>
	<Button class="w-min" on:click={saveApiKey}>Save</Button>
</div>
