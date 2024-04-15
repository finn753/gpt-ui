<script lang="ts">
	import { cn } from "$lib/utils";
	import { Button } from "$lib/components/ui/button";
	import { X } from "lucide-svelte";

	export let imageFiles: File[];

	let className: string = "";
	export { className as class };

	function removeImage(index: number) {
		imageFiles = imageFiles.filter((_, i) => i !== index);
	}
</script>

{#if imageFiles}
	<div class={cn(className, "flex w-full gap-4 overflow-x-auto p-4 pt-6")}>
		{#each imageFiles as imageFile, index}
			<div class="relative">
				<img class="size-24 rounded-lg object-cover" src={URL.createObjectURL(imageFile)} alt={imageFile.name} />
				<Button class="size-6 p-1 rounded-full absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
								on:click={() => removeImage(index)}>
					<X size={16} />
				</Button>
			</div>
		{/each}
	</div>
{/if}
