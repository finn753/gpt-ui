<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { openaiApiKey } from "$lib/stores";
	import { get } from "svelte/store";
	import { toast } from "svelte-sonner";

	export let data;
	$: supabase = data.supabase;

	let apiKey = get(openaiApiKey);

	async function saveApiKey() {
		const userId = await supabase.auth.getUser().then((user) => user.data.user?.id);

		if (userId) {
			const response = await supabase
				.from("Profiles")
				.update({ openai_api_key: apiKey })
				.eq("id", userId);
			if (response.error) {
				toast.error(response.error.message);
			} else {
				openaiApiKey.set(apiKey);
				toast.success("API key saved");
			}
		} else {
			toast.error("You need to be logged in to save your API key.");
		}
	}
</script>

<Label>
	OpenAI API Key
	<Input class="max-w-sm" placeholder="Your API key..." bind:value={apiKey} />
</Label>
<Button on:click={saveApiKey}>Save</Button>
