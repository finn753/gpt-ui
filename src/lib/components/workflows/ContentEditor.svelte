<script lang="ts">
	// @ts-expect-error - svelte-autosize doesn't have types
	import autosize from "svelte-autosize";
	import { onMount, afterUpdate, tick } from 'svelte';
	import { cn } from "$lib/utils";

	let valueSegments: string[] = [];
	let textareaElements: HTMLTextAreaElement[] = [];
	export let value = "";
	export let disabled = false;
	export let placeholder = "";

	onMount(() => (valueSegments = value.split("\n")));
	$: valueSegments = reverseSplit(value, "\n");

	afterUpdate(() => (value = valueSegments.join("\n")));

	$: valueSegments, autosizeAll();

	function reverseSplit(str: string, separator: string) {
		return str.split('').reverse().join('').split(separator).map(item => item.split('').reverse().join('')).reverse();
	}

	async function autosizeAll() {
		await tick();
		textareaElements.forEach((textarea) => autosize.update(textarea));
	}

	async function handleKeyDown(i: number, event: KeyboardEvent) {
		const target = event.target as HTMLTextAreaElement;

		if (
			event.key === "Backspace" &&
			target.selectionStart === 0 &&
			target.selectionEnd === 0
		) {
			event.preventDefault();
			await handleBackspace(i);
		}

		if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
			handleArrowKeys(i, event)
		}
	}

	async function handleBackspace(i: number) {
		if(i > 0) {
			const segmentLength = valueSegments[i].length;

			if (segmentLength === 0) {
				valueSegments = valueSegments.toSpliced(i, 1);
			} else {
				valueSegments[i - 1] += valueSegments[i];
				valueSegments.splice(i, 1);
			}
			textareaElements[i - 1].focus();
			await tick();
			textareaElements[i - 1].setSelectionRange(textareaElements[i - 1].value.length - segmentLength, textareaElements[i - 1].value.length - segmentLength);
		} else {
			if(valueSegments.length > 1) {
				valueSegments = valueSegments.toSpliced(i, 1);
			}
		}
	}

	function handleArrowKeys(i: number, event: KeyboardEvent) {
		const target = event.target as HTMLTextAreaElement;

		if (event.key === "ArrowUp" && target.selectionStart === 0) {
			if (i > 0) {
				textareaElements[i - 1].focus();
			}
		}

		if (event.key === "ArrowDown" && target.selectionStart === target.value.length) {
			if (i < textareaElements.length - 1) {
				textareaElements[i + 1].focus();
			}
		}
	}

	function getStyleClassesForValue(value: string) {
		if (value.startsWith("# ")) return "text-4xl font-bold mt-4";
		if (value.startsWith("## ")) return "text-3xl font-bold mt-4";
		if (value.startsWith("### ")) return "text-2xl font-bold mt-4";
		if (value.startsWith("#### ")) return "text-xl font-bold mt-4";
		if (value.startsWith("##### ")) return "text-lg font-bold mt-4";
		if (value.startsWith("###### ")) return "text-base font-bold mt-4";

		let accumulatedClasses = ""

		if (value.startsWith("- ")) accumulatedClasses += "pl-8 ";

		const linkRegex = /^(- )?https?:\/\/.+\.[a-zA-Z]+\/?\S*$/
		if(linkRegex.test(value)) accumulatedClasses += "text-blue-500 ";

		return accumulatedClasses;
	}
</script>

<div
	class="relative h-full max-h-full overflow-y-auto rounded-3xl bg-muted-foreground bg-opacity-20"
>
	<div class="flex flex-col">
		{#each valueSegments as segment, i (i)}
			<textarea
				class={cn(
					"h-[2.5rem] min-h-0 w-full resize-none rounded-xl bg-transparent p-4 py-2 outline-none transition-colors duration-300 placeholder:text-transparent focus:placeholder:text-muted-foreground hover:bg-muted-foreground hover:bg-opacity-50",
					getStyleClassesForValue(segment)
				)}
				bind:value={segment}
				bind:this={textareaElements[i]}
				use:autosize
				{disabled}
				{placeholder}
				on:keydown={(event) => handleKeyDown(i, event)}
				on:focus={() => (autosize.update(textareaElements[i]))}
			/>
		{/each}
	</div>
</div>
