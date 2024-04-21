<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { openaiApiKey } from "$lib/stores";
	import { tavilyApiKey } from "$lib/stores";
	import { get } from "svelte/store";
	import { toast } from "svelte-sonner";

	export let data;
	$: supabase = data.supabase;

	let openAIKey = get(openaiApiKey);
	let tavilyKey = get(tavilyApiKey);

	async function saveOpenAIApiKey() {
		const userId = await supabase.auth.getUser().then((user) => user.data.user?.id);

		if (userId) {
			const response = await supabase
				.from("Profiles")
				.update({ openai_api_key: openAIKey })
				.eq("id", userId);
			if (response.error) {
				toast.error(response.error.message);
			} else {
				openaiApiKey.set(openAIKey);
				toast.success("API key saved");
			}
		} else {
			toast.error("You need to be logged in to save your API key.");
		}
	}

	async function saveTavilyApiKey() {
		const userId = await supabase.auth.getUser().then((user) => user.data.user?.id);

		if (userId) {
			const response = await supabase
				.from("Profiles")
				.update({ tavily_api_key: tavilyKey })
				.eq("id", userId);
			if (response.error) {
				toast.error(response.error.message);
			} else {
				tavilyApiKey.set(openAIKey);
				toast.success("API key saved");
			}
		} else {
			toast.error("You need to be logged in to save your API key.");
		}
	}
</script>

<Label>
	OpenAI API Key
	<Input class="max-w-sm" placeholder="Your API key..." bind:value={openAIKey} />
</Label>
<Button on:click={saveOpenAIApiKey}>Save</Button>

<Label>
	Tavily API Key
	<Input class="max-w-sm" placeholder="Your API key..." bind:value={tavilyKey} />
</Label>
<Button on:click={saveTavilyApiKey}>Save</Button>
