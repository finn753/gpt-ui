<script lang="ts">
	import { page } from "$app/stores";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";

	export let path = "";
	$: currentPath = $page.url.pathname;

	let className = "";
	export { className as class };
</script>

<Button
	class={cn(
		className,
		"flex w-full justify-start gap-2 pl-2 text-sm font-medium text-muted-foreground"
	)}
	variant={currentPath.startsWith(path) ? "secondary" : "ghost"}
	href={path}
>
	<slot />
</Button>
