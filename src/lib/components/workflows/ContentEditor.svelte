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

	onMount(() => (valueSegments = value.split("\n\n")));
	$: valueSegments = reverseSplit(value, "\n\n");

	afterUpdate(() => (value = valueSegments.join("\n\n")));

	function reverseSplit(str: string, separator: string) {
		return str.split('').reverse().join('').split(separator).map(item => item.split('').reverse().join('')).reverse();
	}

	async function handleKeyDown(i: number, event: KeyboardEvent) {
		const target = event.target as HTMLTextAreaElement;

		if (
			event.key === "Backspace" &&
			target.selectionStart === 0 &&
			target.selectionEnd === 0
		) {
			event.preventDefault();
			handleBackspace(i);
		}

		if (event.key === "Enter") {
			event.preventDefault();

			await handleEnter(i, event);
		}

		if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
			handleArrowKeys(i, event)
		}
	}

	async function handleEnter(i: number, event: KeyboardEvent) {
		const target = event.target as HTMLTextAreaElement;

		if(event.shiftKey) {
			const cursorPosition = target.selectionStart;
			const lineStart = target.value.lastIndexOf("\n", cursorPosition - 1) + 1;
			let lineEnd = target.value.indexOf("\n", cursorPosition);
			if (lineEnd === -1) lineEnd = target.value.length;

			const currentLine = target.value.substring(lineStart, lineEnd);

			if(currentLine === "") return;

			if(target.value[cursorPosition] === "\n") return;

			valueSegments[i] = target.value.substring(0, cursorPosition) + "\n" + target.value.substring(cursorPosition);
		} else {
			if(target.value === "") return;

			valueSegments = valueSegments.toSpliced(i + 1, 0, "");
			await tick();
			textareaElements[i + 1].focus();
		}
	}

	function handleBackspace(i: number) {
		if(i > 0) {
			if (valueSegments[i] === "") {
				valueSegments = valueSegments.toSpliced(i, 1);
			} else {
				valueSegments[i - 1] += "\n" + valueSegments[i];
				valueSegments.splice(i, 1);
			}
			textareaElements[i - 1].focus();
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
		if (value.startsWith("# ")) return "text-4xl font-bold";
		if (value.startsWith("## ")) return "text-3xl font-bold";
		if (value.startsWith("### ")) return "text-2xl font-bold";
		if (value.startsWith("#### ")) return "text-xl font-bold";
		if (value.startsWith("##### ")) return "text-lg font-bold";
		if (value.startsWith("###### ")) return "text-base font-bold";
		return "";
	}
</script>

<div
	class="relative h-full max-h-full overflow-y-auto rounded-3xl bg-muted-foreground bg-opacity-20"
>
	<div class="flex flex-col">
		{#each valueSegments as segment, i (i)}
			<textarea
				class={cn(
					"h-[3.5rem] min-h-0 w-full resize-none rounded-xl bg-transparent p-4 pb-0 outline-none transition-colors duration-300 placeholder:text-muted-foreground hover:bg-muted-foreground hover:bg-opacity-50",
					getStyleClassesForValue(segment)
				)}
				bind:value={segment}
				bind:this={textareaElements[i]}
				use:autosize
				{disabled}
				{placeholder}
				on:keydown={(event) => handleKeyDown(i, event)}
			/>
		{/each}
	</div>
</div>
