<script>
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';

	import { SendHorizontal } from 'lucide-svelte';

	let value = '';
	let rows = 1;
	$: rows = value.split('\n').length;
</script>

<div class="bg-background rounded-2lg flex flex-row items-end">
	<Textarea class="flex-1 resize-none rounded-2lg border-none p-4 leading-normal min-h-0 max-h-[25dvh]" style="height: calc({rows} * 1.5em + 2rem);" bind:value placeholder="Type here..."/>
	<div class="p-2" style="width: calc(1.5em + 2rem); height: calc(1.5em + 2rem);">
		<Button variant="ghost" class="size-full p-2">
			<SendHorizontal size={24}/>
		</Button>
	</div>
</div>