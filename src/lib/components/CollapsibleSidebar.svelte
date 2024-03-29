<script lang="ts">
	import { cn } from "$lib/utils";
	import { Button } from "$lib/components/ui/button";

	import { ChevronRight } from "lucide-svelte";
	import { ChevronLeft } from "lucide-svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let title: string;
	export let orientation: "left" | "right" = "left";
	export let isOpen = true;

	let className = "";
	export { className as class };

	let isRight = orientation === "right";

	$: isRight = orientation === "right";

	$: if (isOpen) dispatch("open");
</script>

<div
	class={cn(
		"pointer-events-none absolute col-span-1 flex size-full h-[calc(100dvh-4rem)] md:relative md:h-dvh md:w-auto",
		isRight ? "flex-row-reverse space-x-reverse" : "",
		isOpen ? "z-10" : "",
		className
	)}
>
	<div
		class={cn(
			"pointer-events-auto flex size-full flex-col overflow-hidden rounded-r-2lg bg-level-two shadow-lg transition-all duration-500",
			isRight ? "rounded-l-2lg rounded-r-none" : "",
			!isOpen ? "w-0" : ""
		)}
	>
		<div class="flex flex-row items-center justify-between bg-background p-4 shadow-lg">
			<h2 class="flex-1 text-2xl font-bold">{title}</h2>
		</div>
		<div class="h-full overflow-y-auto p-4 pb-0">
			<slot />
		</div>
	</div>
	<Button
		variant="link"
		class="pointer-events-auto h-16 px-1 transition-all duration-500"
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
