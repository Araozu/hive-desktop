<script lang="ts">
	import { Progress } from "$lib/components/ui/progress";
	import { Separator } from "$lib/components/ui/separator";
	import { appState } from "$lib/app-state.svelte";
	import { visibleBatches } from "$lib/demo/sample-data";
	import { cn } from "$lib/utils";
	import BatchNewDialog from "./batch-new-dialog.svelte";

	const batches = $derived(visibleBatches(appState.scenario));
	const selectedId = $derived(appState.batchId ?? batches[0]?.batch.id ?? null);

	function select(id: string) {
		appState.batchId = id;
		appState.cellIndex = null;
		appState.listSheetOpen = false;
	}
</script>

<section aria-labelledby="batch-list-heading" class="flex min-h-0 flex-1 flex-col">
	<header class="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
		<h2 id="batch-list-heading" class="text-base font-semibold">Batches</h2>
		<BatchNewDialog />
	</header>

	<Separator />

	{#if batches.length === 0}
		<div class="flex flex-1 flex-col gap-2 p-4">
			<p class="text-sm font-medium">No batches yet</p>
			<p class="text-sm text-muted-foreground">
				A batch runs several prompts across models and settings. Each combination gets its own cell.
			</p>
		</div>
	{:else}
		<ul class="min-h-0 flex-1 overflow-y-auto py-2">
			{#each batches as detail (detail.batch.id)}
				{@const done = detail.batch.statuses.completed ?? 0}
				{@const selected = selectedId === detail.batch.id}
				<li>
					<button
						type="button"
						aria-current={selected ? "true" : undefined}
						onclick={() => select(detail.batch.id)}
						class={cn(
							"flex w-full min-w-0 flex-col gap-2 px-4 py-2.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
							selected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
						)}
					>
						<span class="truncate text-sm font-medium">{detail.batch.spec.name}</span>
						<span class="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
							<span class="truncate">{detail.project_name ?? "No project"}</span>
							<span class="shrink-0 tabular-nums">{detail.batch.total} combinations</span>
						</span>
						<Progress value={done} max={detail.batch.total} class="h-1" aria-label="{done} of {detail.batch.total} complete" />
						<span class="text-xs tabular-nums text-muted-foreground">{done} of {detail.batch.total} complete</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<footer class="border-t px-4 py-3 text-xs text-muted-foreground">
		Sample data. Batches are not created on a node.
	</footer>
</section>
