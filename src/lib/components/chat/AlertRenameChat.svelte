<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { chatDataMap } from "$lib/scripts/misc/stores";
	import { Input } from "$lib/components/ui/input";
	import chatOperations from "$lib/scripts/chat/chat-operations";

	export let chatID: string;

	let value = $chatDataMap[chatID]?.title ?? "";

	async function onRenameChat() {
		await chatOperations.changeTitle(chatID, value);
	}
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger class="w-full p-2 text-left">Rename</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>New title</AlertDialog.Title>
			<AlertDialog.Description>Enter a new title for the chat</AlertDialog.Description>
		</AlertDialog.Header>
		<Input bind:value placeholder="New title" />
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={onRenameChat}>Save</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
