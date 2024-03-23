<script>
	import { Textarea } from "$lib/components/ui/textarea";
	import { Button } from "$lib/components/ui/button";

	import { SendHorizontal } from "lucide-svelte";

	let value = "";
	let rows = 1;
	$: rows = value.split("\n").length;
</script>

<div class="flex flex-row items-end rounded-2lg bg-background">
	<Textarea
		class="max-h-[25dvh] min-h-0 flex-1 resize-none rounded-2lg border-none p-4 leading-normal"
		style="height: calc({rows} * 1.5em + 2rem);"
		bind:value
		placeholder="Type here..."
	/>
	<div class="p-2" style="width: calc(1.5em + 2rem); height: calc(1.5em + 2rem);">
		<Button variant="ghost" class="size-full p-2">
			<SendHorizontal size={24} />
		</Button>
	</div>
</div>
