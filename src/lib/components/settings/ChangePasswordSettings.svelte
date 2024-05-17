<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import database from "$lib/scripts/operations/database";
	import { handleError } from "$lib/scripts/operations/error-handler";
	import { toast } from "svelte-sonner";

	let inputPassword = "";
	let inputConfirmPassword = "";

	async function onChangePassword() {
		if (inputPassword !== inputConfirmPassword) {
			alert(inputPassword + " | " + inputConfirmPassword);
			handleError("Passwords do not match", null);
			return;
		}

		const success = await database.changePassword(inputPassword);

		if (!success) return;

		inputPassword = "";
		inputConfirmPassword = "";

		toast.success("Password changed");
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Change Password</Card.Title>
		<Card.Description>Change your password here</Card.Description>
	</Card.Header>
	<form on:submit={onChangePassword}>
		<Card.Content class="flex flex-col gap-4">
			<Input type="password" placeholder="New password" bind:value={inputPassword} />
			<Input type="password" placeholder="Confirm new password" bind:value={inputConfirmPassword} />
		</Card.Content>
		<Card.Footer class="border-t px-6 py-4">
			<Button type="submit">Change Password</Button>
		</Card.Footer>
	</form>
</Card.Root>
