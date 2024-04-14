<script lang="ts">
	import ToolCard from "$lib/generated_tools/components/ToolCard.svelte";

	export let value: number;
	export let id: never;

	let className: string | null | undefined = "";
	export { className as class };
</script>

<ToolCard class={className}>
	<label for={id} class="p-4 pb-2 text-lg font-semibold">{id}</label>
	<input
		type="number"
		class="w-full flex-1 resize-none rounded-b-3xl bg-transparent p-4 pt-0 outline-none"
		{id}
		bind:value
		placeholder={id}
	/>
</ToolCard>
