<script lang="ts">
	import type { ChatDataMap } from "$lib/types";
	import { Button } from "$lib/components/ui/button";
	import { selectedChatID } from "$lib/stores";
	import { format } from "date-fns";

	export let chatMap: ChatDataMap = {};
</script>

<div class="space-y-2 pb-4">
	<Button class="w-full" href="/chats">New chat</Button>
	{#each Object.entries(chatMap) as [chatId, chat]}
		<Button
			variant={chatId === $selectedChatID ? "secondary" : "ghost"}
			class="flex h-auto w-full flex-col items-start"
			href="/chats/{chatId}"
		>
			<h3 class="whitespace-normal break-words text-base font-bold">
				{chat.title.trim() === "" ? "Untitled" : chat.title}
			</h3>
			<p class="text-base text-muted-foreground whitespace-normal break-words">
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
