<script lang="ts">
	import type { ChatDataMap } from "$lib/types";
	import { Button } from "$lib/components/ui/button";
	import { selectedChatID } from "$lib/stores";
	import { format } from "date-fns";
	import { Ellipsis } from "lucide-svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import AlertDeleteChat from '$lib/components/chat/AlertDeleteChat.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	export let chatMap: ChatDataMap = {};
	export let supabase: SupabaseClient;
</script>

<div class="space-y-2 pb-4">
	<Button class="w-full" href="/chats">New chat</Button>
	{#each Object.entries(chatMap) as [chatId, chat]}
		<Button
			variant={chatId === $selectedChatID ? "secondary" : "ghost"}
			class="group flex h-auto w-full flex-col items-start"
			href="/chats/{chatId}"
		>
			<div class="flex w-full flex-row items-start justify-between">
				<h3 class="whitespace-normal break-words text-base font-bold">
					{chat.title.trim() === "" ? "Untitled" : chat.title}
				</h3>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder><Button
						variant="icon"
						size="none"
						class="opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100"
						builders={[builder]}
						on:click={(event) => {
						event.preventDefault();
					}}><Ellipsis size={16} /></Button
					></DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item>Rename</DropdownMenu.Item>
							<DropdownMenu.Item class="p-0" on:click={(event) => {event.preventDefault()}}><AlertDeleteChat chatID={chatId} supabase={supabase}/></DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<p class="whitespace-normal break-words text-base text-muted-foreground">
				{chat.summary.trim() === "" ? "No summary" : chat.summary}
			</p>

			<div class="py-1">
				<p class="font-light text-muted-foreground">
					Updated: {format(chat.updated_at, "PP, HH:mm")}
				</p>
				<p class="font-light text-muted-foreground">
					Created: {format(chat.created_at, "PP, HH:mm")}
				</p>
			</div>
		</Button>
	{/each}
</div>
