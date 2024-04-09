<script lang="ts">
    import {cn} from "$lib/utils";

    let className: string | null | undefined = "";
    export {className as class};
</script>

<div class={cn(className, "focus-within:border-ring flex flex-col rounded-3xl border bg-card text-card-foreground shadow-sm")}>
    <slot />
</div>