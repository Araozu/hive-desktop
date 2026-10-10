<script lang="ts">
	import type { Snippet } from "svelte";
	import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "$lib/components/ui/sheet";
	import SheetTitlebar from "./sheet-titlebar.svelte";
	import { appState } from "$lib/app-state.svelte";

	/**
	 * A list column that sits beside its detail at wide widths and becomes a
	 * sheet below the `lg` breakpoint. Visibility is shared app state.
	 */
	let { label, children }: { label: string; children: Snippet } = $props();
</script>

{#if appState.lg && appState.listVisible}
	<div class="flex w-72 shrink-0 flex-col border-r">
		{@render children()}
	</div>
{/if}

<Sheet open={!appState.lg && appState.listSheetOpen} onOpenChange={(open) => (appState.listSheetOpen = open)}>
	<SheetContent side="left" showCloseButton={false} class="w-80 gap-0 p-0 sm:max-w-xs">
		<SheetHeader class="sr-only">
			<SheetTitle>{label}</SheetTitle>
			<SheetDescription>Choose an item to view its details.</SheetDescription>
		</SheetHeader>
		<SheetTitlebar />
		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
	</SheetContent>
</Sheet>
