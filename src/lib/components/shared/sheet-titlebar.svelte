<script lang="ts">
	import { SheetClose } from "$lib/components/ui/sheet";
	import { Button } from "$lib/components/ui/button";
	import XIcon from "phosphor-svelte/lib/XIcon";

	/** Top bar for a sheet: an optional title and a close button that never overlaps content. */
	let { title = "" }: { title?: string } = $props();
</script>

<div class="flex min-h-10 items-center justify-between gap-2 border-b py-1 pr-2 pl-4">
	<span class="text-sm font-medium">{title}</span>
	<SheetClose>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon-sm" aria-label="Close panel">
				<XIcon size={16} aria-hidden="true" />
			</Button>
		{/snippet}
	</SheetClose>
</div>
