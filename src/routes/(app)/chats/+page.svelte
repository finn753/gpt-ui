<script lang="ts">
	import ChatView from "$lib/components/chat/ChatView.svelte";
	import { onMount } from "svelte";
	import { selectedChatID } from "$lib/scripts/misc/stores";

	onMount(() => {
		selectedChatID.set("");
	});
</script>

<!-- New Chat -->
<ChatView chatID="" />
