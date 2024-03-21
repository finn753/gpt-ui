<script lang="ts">
	import { cn } from "$lib/utils";
	import { Button } from "$lib/components/ui/button";

	import { ChevronRight } from "lucide-svelte";
	import { ChevronLeft } from "lucide-svelte";

	export let title: string;
	export let orientation: "left" | "right" = "left";
	export let isOpen = true;

	let isRight = orientation === "right";

	$: isRight = orientation === "right";
</script>

<div class={cn("flex size-full", isRight ? "flex-row-reverse space-x-reverse" : "")}>
	<div
		class={cn(
			"size-full overflow-hidden rounded-r-2lg bg-level-two shadow-lg transition-all duration-500",
			isRight ? "rounded-l-2lg rounded-r-none" : "",
			!isOpen ? "w-0" : ""
		)}
	>
		<div class={cn("flex flex-row items-center justify-between bg-background p-4 shadow-lg")}>
			<h2 class="flex-1 text-2xl font-bold">{title}</h2>
		</div>
		<div class="p-4 pb-0">
			<slot />
		</div>
	</div>
	<Button
		variant="link"
		class="h-16 px-1 transition-all duration-500"
		on:click={() => {
			isOpen = !isOpen;
		}}
	>
		{#if (isRight && !isOpen) || (!isRight && isOpen)}
			<ChevronLeft size={24} />
		{:else}
			<ChevronRight size={24} />
		{/if}
	</Button>
</div>
