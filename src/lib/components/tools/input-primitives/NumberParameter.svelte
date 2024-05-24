<script lang="ts">
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";

	export let id: string;
	export let value: number;

	let internalValue: string;

	$: value = Number(internalValue);
</script>

<Label>
	{id}
	<Input type="number" class="resize-y" bind:value={internalValue} {id} />
</Label>
