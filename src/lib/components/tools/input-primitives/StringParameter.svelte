<script lang="ts">
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";

	export let id: string;
	export let value: string;
</script>

<Label>
	{id}
	<Textarea class="resize-y" bind:value {id} />
</Label>
