<script>
	import CollapsibleSidebar from "$lib/components/CollapsibleSidebar.svelte";
</script>

<div class="grid h-full grid-cols-3 lg:grid-cols-4">
	<div class="col-span-1">
		<CollapsibleSidebar title="Chats">Test</CollapsibleSidebar>
	</div>
	<div class="col-span-1 lg:col-span-2">
		<slot />
	</div>
	<div class="col-span-1">
		<CollapsibleSidebar title="Context" orientation="right">Testilein</CollapsibleSidebar>
	</div>
</div>
