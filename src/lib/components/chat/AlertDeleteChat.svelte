<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { chatDataMap } from "$lib/stores";
	import chatOperations from "$lib/chatOperations";
	import { goto } from "$app/navigation";

	export let chatID: string;

	async function onDeleteChat() {
		await chatOperations.deleteChat(chatID);
		await goto("/chats");
	}
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger class="w-full p-2 text-left">Delete chat</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title
				>Do you want to delete "{$chatDataMap[chatID].title || "Untitled"}"?</AlertDialog.Title
			>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete the chat and all its messages
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				on:click={onDeleteChat}>Delete Chat</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
