<script>
	import ChatView from "$lib/components/chat/ChatView.svelte";
	import { onMount } from "svelte";
	import { selectedChatID } from "$lib/stores";

	onMount(() => {
		selectedChatID.set("");
	});
</script>

<!-- New Chat -->
<ChatView chat_id="" />
