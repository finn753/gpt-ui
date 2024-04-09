<script lang="ts">
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { page } from "$app/stores";
	import { AudioLines, Image } from "lucide-svelte";

	const size = 24;
	const strokeWidth = 2;

	$: currentPath = $page.url.pathname;

	let sidebarOpened = false;

	function handleMobileSidebar() {
		if (window.innerWidth < 768) {
			sidebarOpened = false;
		}
	}

	onMount(() => {
		if (window.innerWidth >= 768) {
			sidebarOpened = true;
		}
	});
</script>

<svelte:window on:resize={() => handleMobileSidebar()} />

<div class="relative grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
	<CollapsibleSidebar
		class="z-10"
		title="Generator"
		bind:isOpen={sidebarOpened}
		on:open={() => handleMobileSidebar()}
	>
		<div class="flex flex-col gap-2">
			<Button
				class="flex w-full justify-start gap-2 pl-2 text-sm font-medium text-muted-foreground"
				variant={currentPath.startsWith("/generator/images") ? "secondary" : "ghost"}
				href="/generator/images"
			>
				<Image {size} {strokeWidth} />
				Image Generator
			</Button>
			<Button
				class="flex w-full justify-start gap-2 pl-2 text-sm font-medium text-muted-foreground"
				variant={currentPath.startsWith("/generator/voice") ? "secondary" : "ghost"}
				href="/generator/voice"
			>
				<AudioLines {size} {strokeWidth} />
				Text To Speech
			</Button>
		</div>
	</CollapsibleSidebar>
	<div class="col-span-1 h-full max-h-full min-h-0 lg:col-span-2">
		<slot />
	</div>
</div>
