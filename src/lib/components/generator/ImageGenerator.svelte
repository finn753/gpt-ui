<script lang="ts">
	import { cn } from '$lib/utils';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let className = "";

	export {className as class };
</script>

<div class={cn("flex flex-col p-4 px-8 gap-2", className)}>
	<h1 class="text-2xl font-bold">Image Generator</h1>

	<div class="flex w-full gap-2">
		<Input placeholder="Describe the picture you want..." />
		<Button class="h-10">Generate</Button>
	</div>
</div>