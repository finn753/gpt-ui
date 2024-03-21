<script>
	import { Button } from "$lib/components/ui/button";
	import { MessagesSquare, User } from "lucide-svelte";
</script>

<div class="flex h-dvh w-dvw flex-col-reverse md:flex-row">
	<div
		class="z-10 flex h-16 w-dvw items-center justify-evenly bg-background p-4 shadow-lg md:h-dvh md:w-16 md:flex-col"
	>
		<Button variant="ghost" href="/chats">
			<MessagesSquare size={24} />
		</Button>

		<div class="hidden md:block md:flex-1"></div>

		<Button variant="ghost" href="/settings">
			<User />
		</Button>
	</div>
	<div class="flex-1">
		<slot />
	</div>
</div>
