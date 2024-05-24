<script lang="ts">
	export let data: object;
</script>

<div class="flex flex-col gap-4">
	{#each Object.entries(data) as [key, value]}
		{#if typeof value !== "object"}
			<div>
				<p class="text-muted-foreground">{key}</p>
				<p>{value}</p>
			</div>
		{/if}
	{/each}
</div>
