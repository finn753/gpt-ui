<script lang="ts">
	import { cn } from "$lib/scripts/misc/utils";

	let className: string | null | undefined = "";
	export { className as class };
</script>

<div
	class={cn(
		className,
		"flex flex-col rounded-3xl border bg-card text-card-foreground shadow-sm focus-within:border-ring"
	)}
>
	<slot />
</div>
