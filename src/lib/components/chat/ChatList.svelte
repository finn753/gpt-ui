<script lang="ts">
	import type { ChatDataMap, ChatStructure } from "$lib/types";
	import { Button } from "$lib/components/ui/button";
	import { selectedChatID } from "$lib/stores";
	import { format } from "date-fns";
	import { Ellipsis } from "lucide-svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import AlertDeleteChat from "$lib/components/chat/AlertDeleteChat.svelte";
	import AlertRenameChat from "$lib/components/chat/AlertRenameChat.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { Input } from "$lib/components/ui/input";
	import * as chatService from "$lib/chatService";
	import { Separator } from "$lib/components/ui/separator";

	export let chatMap: ChatDataMap = {};

	let searchQuery = "";

	let chatEntries: [string, ChatStructure][] = Object.entries(chatMap);

	$: {
		chatEntries = Object.entries(chatMap);

		if (searchQuery.trim() !== "") {
			chatEntries = Object.entries(chatService.searchChats(chatMap, searchQuery.trim()));
		}
	}
</script>

<div class="h-full space-y-2">
	<Button class="h-10 w-full" href="/chats">New chat</Button>
	<Input type="search" placeholder="Search chats" class="h-10 w-full" bind:value={searchQuery} />

	<div class="h-[calc(100%-6rem)] space-y-2 overflow-y-auto pb-4">
		{#each chatEntries as [chatID, chat]}
			<Button
				variant={chatID === $selectedChatID ? "secondary" : "ghost"}
				class="group flex h-auto w-full flex-col items-start"
				href="/chats/{chatID}"
			>
				<div class="flex w-full flex-row items-start justify-between">
					<h3 class="whitespace-normal break-words text-base font-bold">
						{chat.title.trim() === "" ? "Untitled" : chat.title}
					</h3>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button
								variant="icon"
								size="none"
								class="opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100"
								builders={[builder]}
								on:click={(event) => {
									event.preventDefault();
								}}
							>
								<Ellipsis size={16} />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Group>
								<DropdownMenu.Item
									class="p-0"
									on:click={(event) => {
										event.preventDefault();
									}}
								>
									<AlertRenameChat {chatID} />
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="p-0"
									on:click={(event) => {
										event.preventDefault();
									}}
								>
									<AlertDeleteChat {chatID} />
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<p class="whitespace-normal break-words text-base text-muted-foreground">
					{chat.summary.trim() === "" ? "No summary" : chat.summary}
				</p>

				<div class="flex w-full flex-wrap gap-1 py-2">
					{#each chat.tags as tag}
						<Badge>{tag}</Badge>
					{/each}
				</div>

				<div class="py-1">
					<table class="font-light text-muted-foreground">
						<tr>
							<td>Updated:</td>
							<td>{format(chat.updated_at, "PP, HH:mm")}</td>
						</tr>
						<tr>
							<td>Created:</td>
							<td>{format(chat.created_at, "PP, HH:mm")}</td>
						</tr>
					</table>
				</div>
			</Button>
			<div class="px-4 last:hidden">
				<Separator />
			</div>
		{/each}
	</div>
</div>
