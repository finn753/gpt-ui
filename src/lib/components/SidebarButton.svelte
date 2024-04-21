<script lang="ts">
	import { page } from "$app/stores";
	import { Button } from "$lib/components/ui/button";

	export let path = "";
	$: currentPath = $page.url.pathname;
</script>

<Button
	class="flex w-full justify-start gap-2 pl-2 text-sm font-medium text-muted-foreground"
	variant={currentPath.startsWith(path) ? "secondary" : "ghost"}
	href={path}
>
	<slot />
</Button>
