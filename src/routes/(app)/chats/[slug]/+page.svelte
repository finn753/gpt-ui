<script lang="ts">
	import ChatView from "$lib/components/chat/ChatView.svelte";
	import { chatContentMap, selectedChatID } from "$lib/stores";
	import { beforeNavigate } from "$app/navigation";
	import { get } from "svelte/store";

	export let data;

	let chat_id = data.chat_id;
	$: {
		chat_id = data.chat_id;
		selectedChatID.set(chat_id);
	}

	let chatDataMap = data.chatDataMap;
	$: chatDataMap = data.chatDataMap;
	$: chatContentMap.set({ ...chatDataMap, ...get(chatContentMap) });

	let generating = false;

	function beforeUnload(event: BeforeUnloadEvent) {
		if (generating) {
			event.preventDefault();
			return "";
		}
	}

	beforeNavigate(({ cancel }) => {
		if (generating) {
			if (
				!confirm(
					"You are trying to leave the page while generating. Are you sure you want to leave?"
				)
			) {
				cancel();
			}
		}
	});
</script>

<svelte:window on:beforeunload={beforeUnload} />

<ChatView {chat_id} />
