<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { deleteChat } from '$lib/helper';
	import { chatDataMap } from '$lib/stores';

	export let chatID: string;
	export let supabase: SupabaseClient;

	async function onDeleteChat() {
		await deleteChat(chatID, supabase);
	}
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger class="w-full text-left p-2">Delete chat</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Do you want to delete "{$chatDataMap[chatID].title || "Untitled"}"?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete the chat and all its messages
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={onDeleteChat}>Delete Chat</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>