<script lang="ts">
	import { Button } from "$lib/components/ui/button";

	import { Image, LoaderCircle, SendHorizontal } from "lucide-svelte";
	import { cn } from "$lib/utils";
	import { createEventDispatcher } from "svelte";
	import ImageListInput from "$lib/components/chat/ImageListInput.svelte";

	const dispatch = createEventDispatcher<{ submit: { value: string, images?: File[] } }>();

	export let canAttachImages = true;
	export let generating = false;
	export let value = "";
	let rows = 1;
	$: rows = value.split("\n").length;

	let inputElement: HTMLTextAreaElement;
	let fileInputElement: HTMLInputElement;

	let imageInputFileList: FileList;
	let imageInputFiles: File[] = [];
	$: imageInputFileList, onImageInputChanged();

	function onImageInputChanged() {
		imageInputFiles = imageInputFileList ? Array.from(imageInputFileList) : [];
	}

	let cursorPos = 0;
	let actionWord: string = "";
	$: actionWord =
		value
			.slice(0, cursorPos)
			.split(/[\s\n]+/)
			.pop() || "";
	$: {
		isActionCommand = false;
		isActionMention = false;

		if (actionWord.startsWith("/")) {
			isActionCommand = true;
		}

		if (actionWord.startsWith("@")) {
			isActionMention = true;
		}
	}

	let isActionCommand = false;
	let isActionMention = false;

	$: if(!canAttachImages) imageInputFiles = [];

	function updateCursorPos() {
		cursorPos = inputElement.selectionStart;
	}

	function send() {
		if (value.trim() === "") return;

		dispatch("submit", { value, images: imageInputFiles});
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			send();
		}
	}
</script>

<div class="rounded-2lg bg-background">
	<div class={cn(isActionCommand ? "block" : "hidden")}>Command: {actionWord}</div>
	<div class={cn(isActionMention ? "block" : "hidden")}>Mention: {actionWord}</div>
	<div class={cn(imageInputFiles.length > 0 ? "block" : "hidden")}>
		<ImageListInput bind:imageFiles={imageInputFiles} />
	</div>

	<div class="flex flex-row items-end">
		<div class="size-[calc(1.5em+2rem)] p-2">
			<input
				type="file"
				bind:this={fileInputElement}
				class="hidden"
				accept="image/png, image/jpeg, image/webp, image/gif"
				multiple
				bind:files={imageInputFileList}
			/>
			<Button
				variant="ghost"
				class="size-full p-2"
				on:click={() => {
					if (fileInputElement) fileInputElement.click();
				}}
				disabled={!canAttachImages}
			>
				<Image size={24} />
			</Button>
		</div>
		<textarea
			class="max-h-[25dvh] min-h-0 flex-1 resize-none rounded-2lg border-none bg-background p-4 pl-0 leading-normal outline-none placeholder:text-muted-foreground"
			style="height: calc({rows} * 1.5em + 2rem);"
			bind:value
			bind:this={inputElement}
			on:click={updateCursorPos}
			on:keyup={updateCursorPos}
			on:keydown={onKeyDown}
			placeholder={generating ? "Generating..." : "Type here..."}
			disabled={generating}
		/>
		<div class="size-[calc(1.5em+2rem)] p-2">
			{#if !generating}
				<Button
					variant="ghost"
					class="size-full p-2"
					on:click={send}
					disabled={value.trim() === ""}
				>
					<SendHorizontal size={24} />
				</Button>
			{:else}
				<div class="size-full p-2">
					<LoaderCircle class="animate-spin opacity-50" size={24} />
				</div>
			{/if}
		</div>
	</div>
</div>
