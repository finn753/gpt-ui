<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import { Button } from "$lib/components/ui/button";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import PromptInput from "$lib/components/workflows/PromptInput.svelte";
	import { type MessageFormat, ModelWrapper } from "$lib/scripts/api-wrapper/ModelWrapper";

	let clipboard: string[] = [];
	let content = "";
	let contentHistory: string[] = [];
	let inputValue = "";

	let generating = false;

	async function generate() {
		if (generating || !inputValue) return;

		const model = new ModelWrapper("openai:gpt-4o");

		generating = true;

		const messages: MessageFormat[] = [];
		if (content) {
			messages.push({ role: "assistant", content });
		}
		messages.push({ role: "user", content: inputValue });

		const stream = model.streamToolAgentResponse(messages);

		for await (const message of stream) {
			content = message[0].content;
		}

		inputValue = "";
		contentHistory = [content, ...contentHistory];

		generating = false;
	}
</script>

<div class="grid size-full grid-cols-4 items-center">
	<CollapsibleSidebar title="Workflow (Preview)" class="z-10">
		<Tabs.Root value="Clipboard" class="size-full">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="Clipboard">Clipboard</Tabs.Trigger>
				<Tabs.Trigger value="History">History</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="Clipboard">
				{#if clipboard.length === 0}
					<div class="flex h-[80%] items-center justify-center">
						<p class="text-muted-foreground">Nothing here yet</p>
					</div>
				{:else}
					<div>
						{#each clipboard as item}
							<Button variant="glass">
								{item}
							</Button>
						{/each}
					</div>
				{/if}
			</Tabs.Content>
			<Tabs.Content value="History">
				{#if contentHistory.length === 0}
					<div class="flex h-[80%] items-center justify-center">
						<p class="text-muted-foreground">Nothing here yet</p>
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each contentHistory as item}
							<Button
								class="h-auto w-full"
								variant="glass"
								on:click={() => (content = item)}
								disabled={generating}
							>
								<div class="flex w-full flex-row items-start justify-between">
									<p class="whitespace-normal text-base text-muted-foreground">
										{item}
									</p>
								</div>
							</Button>
						{/each}
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</CollapsibleSidebar>
	<div class="col-span-2 flex h-full flex-col gap-2 py-4 pt-16">
		<Textarea
			class="flex-1 resize-none rounded-3xl p-4"
			bind:value={content}
			disabled={generating}
		/>
		<PromptInput bind:value={inputValue} bind:generating on:submit={generate} />
	</div>
</div>
