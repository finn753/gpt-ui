<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { goto } from "$app/navigation";

	export let data;
	$: supabase = data.supabase;

	let inputEmail = "";
	let inputPassword = "";

	function signInWithEmail() {
		supabase.auth
			.signInWithPassword({
				email: inputEmail,
				password: inputPassword
			})
			.then(() => {
				goto("/chats");
			})
			.catch((error) => {
				console.log(error);
			});
	}
</script>

<div class="flex h-dvh w-full items-center justify-center bg-level-two">
	<Card.Root class="max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						bind:value={inputEmail}
						required
					/>
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
						<a href="##" class="ml-auto inline-block text-sm underline"> Forgot your password? </a>
					</div>
					<Input id="password" type="password" bind:value={inputPassword} required />
				</div>
				<Button class="w-full" on:click={signInWithEmail}>Login</Button>
			</div>
			<div class="mt-4 text-center text-sm">This is a private site, not for public interest</div>
		</Card.Content>
	</Card.Root>
</div>
