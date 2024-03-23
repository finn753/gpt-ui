<script lang="ts">
	import ChatInput from "$lib/components/chat/ChatInput.svelte";
	import type { Message } from "$lib/types";
	import ChatMessage from "$lib/components/chat/ChatMessage.svelte";

	let testMessage: Message = {
		id: "1",
		text: "Hello, World!",
		role: "assistant",
		model: "gpt-3.5-turbo",
		created_at: new Date("2021-09-01T12:00:00Z")
	};

	let messages: Message[] = [
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage,
		testMessage
	];
</script>

<div class="relative flex size-full flex-col px-4 pb-4 md:px-0">
	<div class="flex-1 overflow-y-auto">
		<div class="flex flex-col-reverse">
			{#each messages as message}
				<ChatMessage {...message} />
			{/each}
		</div>
	</div>
	<ChatInput />
</div>
