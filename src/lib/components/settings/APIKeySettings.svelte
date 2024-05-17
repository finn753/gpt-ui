<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { type Writable } from "svelte/store";
	import database from "$lib/scripts/operations/database";

	export let apiKeyStore: Writable<string | null>;
	export let label: string;
	export let slug: string;

	let inputValue = $apiKeyStore;

	async function saveApiKey() {
		const success = await database.changeApiKey(slug, inputValue || "");

		if (success) apiKeyStore.set(inputValue);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{label}</Card.Title>
		<Card.Description>
			Put in your API Key to access the service
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form>
			<Input type="password" placeholder="Your API key..." bind:value={inputValue} />
		</form>
	</Card.Content>
	<Card.Footer class="border-t px-6 py-4">
		<Button class="w-min" on:click={saveApiKey}>Save</Button>
	</Card.Footer>
</Card.Root>

