<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import { Button } from "$lib/components/ui/button";
	import PromptInput from "$lib/components/workflows/PromptInput.svelte";
	import { type MessageFormat, ModelWrapper } from "$lib/scripts/api-wrapper/ModelWrapper";
	import { Clipboard, Copy, ListPlus, Pin } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import SvelteMarkdown from "svelte-markdown";
	import { getWebsiteContent, runTavilySearch } from "$lib/scripts/api-wrapper/browsing";
	import ContentEditor from "$lib/components/workflows/ContentEditor.svelte";

	let mode: "generator" | "browser" = "generator";

	let content = "";
	let contentHistory: string[] = [];
	let clipboard: string[] = [];
	let results: string[] = [];

	let inputValue = "";

	let generating = false;

	async function onSubmit() {
		if (generating || !inputValue) return;

		if (content && !contentHistory.includes(content)) contentHistory = [content, ...contentHistory];

		generating = true;

		if (mode === "generator") await generate();
		if (mode === "browser") await browse();

		contentHistory = [content, ...contentHistory];

		inputValue = "";
		generating = false;
	}

	async function browse() {
		const links = inputValue.match(/(https?:\/\/\S+)/g) || [];

		const results: string[] = [];

		if (links.length === 0) {
			const searchResults = await runTavilySearch(inputValue);

			if ("error" in searchResults) {
				toast.error(searchResults.error);
				return;
			}

			for (const result of searchResults.results) {
				results.push(`## ${result.title}\n\n${result.url}\n\n${result.content}`);
			}

			content = results.join("\n\n");
		} else {
			for (const link of links) {
				const websiteContent = await getWebsiteContent(link);

				if (websiteContent) {
					results.push(websiteContent);
				}
			}

			content = results.join("\n\n");
		}
	}

	async function generate() {
		const model = new ModelWrapper("openai:gpt-4o");

		const messages: MessageFormat[] = [
			{
				role: "system",
				content:
					"Only give me the thing I asked for.\nExample: If I asked for bullet points, only give me the bullet points" +
					"\n\nYou can use markdown for structuring.\nAllowed symbols are headings # and bullet points -, no other markdown is allowed, no **bold** or *italic*"
			}
		];
		if (content) {
			messages.push({ role: "assistant", content });
		}
		messages.push({ role: "user", content: inputValue });

		const stream = model.streamToolAgentResponse(messages);

		for await (const message of stream) {
			content = message[0].content;
		}
	}

	function onPin() {
		clipboard = [content, ...clipboard];
	}

	function onCopy() {
		navigator.clipboard.writeText(content);
		toast.success("Copied to clipboard");
	}

	function onCopyResult() {
		navigator.clipboard.writeText(results.join("\n\n"));
		toast.success("Copied to clipboard");
	}

	function onAddResult() {
		results = [...results, content];
	}
</script>

<div class="grid size-full grid-cols-4 items-center">
	<CollapsibleSidebar title="Pinned" class="z-10">
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
					<div class="flex flex-col gap-2">
						{#each clipboard as item}
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
	<div class="col-span-2 flex h-full flex-col gap-2 overflow-y-auto py-4 pt-16">
		<ContentEditor bind:value={content} disabled={generating} placeholder="Content here..." />
		<div class="flex flex-row items-center justify-between">
			<div class="flex flex-row items-center justify-start gap-2">
				<Button
					variant={mode === "generator" ? "default" : "glass"}
					class="h-12 rounded-xl text-base"
					on:click={() => (mode = "generator")}
				>
					Generator
				</Button>

				<Button
					variant={mode === "browser" ? "default" : "glass"}
					class="h-12 rounded-xl text-base"
					on:click={() => (mode = "browser")}
				>
					Browser
				</Button>
			</div>
			<div class="flex flex-row items-center justify-end gap-2">
				<Button
					variant="glass"
					size="icon"
					class="size-12 rounded-xl p-2.5"
					disabled={generating || content === "" || clipboard.includes(content)}
					on:click={onPin}
				>
					<Pin />
				</Button>

				<Button
					variant="glass"
					size="icon"
					class="size-12 rounded-xl p-2.5"
					disabled={generating || content === ""}
					on:click={onCopy}
				>
					<Copy />
				</Button>

				<Button
					variant="glass"
					size="icon"
					class="size-12 rounded-xl p-2.5"
					disabled={generating || content === "" || results.includes(content)}
					on:click={onAddResult}
				>
					<ListPlus />
				</Button>
			</div>
		</div>
		<PromptInput bind:value={inputValue} bind:generating on:submit={onSubmit} />
	</div>
	<CollapsibleSidebar title="Result" orientation="right">
		<Button variant="glass" class="w-full" disabled={results.length === 0} on:click={onCopyResult}>
			<Clipboard /> Copy to clipboard
		</Button>
		<p
			class="prose dark:prose-invert prose-h1:text-xl prose-h1:font-bold prose-p:text-justify prose-a:text-blue-600 prose-img:rounded-xl"
		>
			<SvelteMarkdown source={results.join("\n\n")} />
		</p>
	</CollapsibleSidebar>
</div>
