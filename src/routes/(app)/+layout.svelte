<script>
	import { Button } from "$lib/components/ui/button";
	import { MessagesSquare, User, Images, Brush, LayoutTemplate } from "lucide-svelte";

	const size = 24;
	const strokeWidth = 2;
	const color = "#64748B";
</script>

<div class="flex h-dvh max-h-dvh w-dvw flex-col-reverse md:flex-row">
	<div
		class="z-20 flex h-16 w-dvw items-center justify-evenly bg-background p-4 shadow-lg md:h-dvh md:w-16 md:flex-col md:space-y-4"
	>
		<Button variant="ghost" href="/chats">
			<MessagesSquare {size} {strokeWidth} {color} />
		</Button>

		<Button variant="ghost" href="/generator">
			<Brush {size} {strokeWidth} {color} />
		</Button>

		<Button variant="ghost" href="/gallery">
			<Images {size} {strokeWidth} {color} />
		</Button>

		<Button variant="ghost" href="/templates">
			<LayoutTemplate {size} {strokeWidth} {color} />
		</Button>

		<div class="hidden md:block md:flex-1"></div>

		<Button variant="ghost" href="/settings">
			<User {size} {strokeWidth} {color} />
		</Button>
	</div>
	<div class="flex-1 h-[calc(100dvh-4rem)] md:h-dvh">
		<slot />
	</div>
</div>
