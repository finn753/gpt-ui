<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	// @ts-expect-error - svelte-autosize doesn't have types
	import autosize from "svelte-autosize";

	import { Image, LoaderCircle, SendHorizontal } from "lucide-svelte";
	import { cn } from "$lib/utils";
	import { createEventDispatcher } from "svelte";
	import ImageListInput from "$lib/components/chat/ImageListInput.svelte";
	import InputAction from "$lib/components/chat/InputAction.svelte";
	import {
		applyModelTemplate,
		defaultModelTemplates,
		type ModelTemplate
	} from "$lib/scripts/misc/model-templates";
	import { customModelTemplates } from "$lib/scripts/misc/stores";

	const dispatch = createEventDispatcher<{ submit: { value: string; images?: File[] } }>();

	export let canAttachImages = true;
	export let generating = false;
	export let value = "";

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
		isActionMention = actionWord.startsWith("@");
	}

	let isActionCommand = false;
	let isActionMention = false;

	let mentionElement: ModelTemplate | undefined;

	$: if (!canAttachImages) imageInputFiles = [];

	function updateCursorPos() {
		cursorPos = inputElement.selectionStart;
	}

	function send() {
		if (value.trim() === "") return;

		dispatch("submit", { value, images: imageInputFiles });

		imageInputFiles = [];

		// Set height of textarea to h-[calc(1.5em+2rem)]
		inputElement.style.height = "calc(1.5em + 2rem)";
	}

	function onKeyDown(event: KeyboardEvent) {
		if (isActionMention) {
			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				event.preventDefault();
			}

			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				deleteActionWord();

				if (mentionElement) {
					applyModelTemplate(mentionElement);
				}

				return;
			}
		}

		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			send();
		}
	}

	function deleteActionWord() {
		if (!actionWord) return;

		const start = value.slice(0, cursorPos).lastIndexOf(actionWord);

		value = value.slice(0, start) + value.slice(start + actionWord.length);
	}
</script>

<div class="rounded-2lg bg-background">
	<div class={cn(isActionCommand ? "block" : "hidden")}>Command: {actionWord}</div>
	<div class={cn(isActionMention ? "block" : "hidden")}>
		<InputAction
			{actionWord}
			actionElements={[...defaultModelTemplates, ...$customModelTemplates].map((template) => {
				return { name: template.name, element: template };
			})}
			bind:selectedElement={mentionElement}
		/>
	</div>
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
			class="h-[calc(1.5em+2rem)] max-h-[25dvh] min-h-0 flex-1 resize-none rounded-2lg border-none bg-background p-4 pl-0 leading-normal outline-none placeholder:text-muted-foreground"
			bind:value
			bind:this={inputElement}
			use:autosize
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
