<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { database } from "$lib/database";
	import { handleError } from "$lib/errorHandler";
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

<h2 class="text-lg font-bold">Change Password</h2>
<form class="flex flex-col gap-2" on:submit={onChangePassword}>
	<Label>
		New Password
		<Input type="password" class="max-w-sm" bind:value={inputPassword} />
	</Label>
	<Label>
		Confirm New Password
		<Input type="password" class="max-w-sm" bind:value={inputConfirmPassword} />
	</Label>
	<Button class="max-w-sm" type="submit">Change Password</Button>
</form>
