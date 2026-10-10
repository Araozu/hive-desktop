<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	import { Separator } from "$lib/components/ui/separator";
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import BatchComb from "./batch-comb.svelte";
	import BatchCellDetail from "./batch-cell-detail.svelte";
	import { appState } from "$lib/app-state.svelte";
	import { turnStatusMeta } from "$lib/status";
	import type { BatchDetail } from "$lib/view/types";
	import SidebarSimpleIcon from "phosphor-svelte/lib/SidebarSimpleIcon";

	let { detail }: { detail: BatchDetail } = $props();

	const spec = $derived(detail.batch.spec);
	const total = $derived(detail.batch.total);
	const done = $derived(detail.batch.statuses.completed ?? 0);
	const selected = $derived(detail.members.find((m) => m.task.combination_index === appState.cellIndex) ?? null);

	const STATUS_ORDER = ["running", "queued", "paused", "completed", "failed", "interrupted", "incomplete", "cancelled"];
	const counts = $derived(
		STATUS_ORDER.filter((s) => (detail.batch.statuses[s] ?? 0) > 0).map((s) => ({
			status: s,
			count: detail.batch.statuses[s] ?? 0,
		})),
	);

	function selectCell(index: number) {
		appState.cellIndex = appState.cellIndex === index ? null : index;
	}
</script>

<section aria-label="Batch" class="flex min-h-0 min-w-0 flex-1 flex-col">
	<header class="flex flex-col gap-3 border-b px-4 py-3 lg:px-6">
		<div class="flex items-start gap-3">
			<Button
				variant="ghost"
				size="icon-sm"
				class="mt-0.5 shrink-0 lg:hidden"
				aria-label="Show batches"
				onclick={() => appState.toggleList()}
			>
				<SidebarSimpleIcon size={18} aria-hidden="true" />
			</Button>
			<div class="min-w-0 flex-1">
				<h2 class="truncate text-lg font-semibold tracking-tight">{spec.name}</h2>
				<dl class="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
					<div class="flex gap-1.5">
						<dt class="text-muted-foreground">Project</dt>
						<dd>{detail.project_name ?? "None"}</dd>
					</div>
					<div class="flex gap-1.5">
						<dt class="text-muted-foreground">Prompts</dt>
						<dd class="tabular-nums">{spec.prompts.length}</dd>
					</div>
					<div class="flex gap-1.5">
						<dt class="text-muted-foreground">Models</dt>
						<dd class="tabular-nums">{spec.models.length}</dd>
					</div>
					<div class="flex gap-1.5">
						<dt class="text-muted-foreground">Output limits</dt>
						<dd class="font-mono tabular-nums">{spec.settings.map((s) => s.max_output_tokens ?? "default").join(", ")}</dd>
					</div>
					<div class="flex gap-1.5">
						<dt class="text-muted-foreground">Concurrency</dt>
						<dd class="tabular-nums">{spec.max_concurrent_runs} at a time</dd>
					</div>
					<div class="flex gap-1.5">
						<dt class="text-muted-foreground">Base</dt>
						<dd class="font-mono">{spec.project?.base_ref ?? "HEAD"}</dd>
					</div>
				</dl>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
				<p class="text-sm tabular-nums">
					<span class="font-medium">{done}</span>
					<span class="text-muted-foreground">of {total} complete</span>
				</p>
				<div class="flex flex-wrap items-center gap-1.5">
					{#each counts as item (item.status)}
						<StatusBadge meta={turnStatusMeta(item.status)} class="tabular-nums" />
						<span class="text-xs tabular-nums text-muted-foreground">{item.count}</span>
					{/each}
				</div>
			</div>
			<Progress value={done} max={total} class="h-1.5" aria-label="{done} of {total} complete" />
		</div>
	</header>

	<div class="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row">
		<div class="flex min-w-0 flex-1 flex-col items-start p-6">
			{#key detail.batch.id}
				<BatchComb members={detail.members} selectedIndex={appState.cellIndex} onselect={selectCell} />
			{/key}
		</div>

		<Separator class="xl:hidden" />

		<aside class="w-full p-4 xl:w-96 xl:shrink-0 xl:border-l xl:p-6" aria-label="Selected combination">
			<BatchCellDetail member={selected} {total} />
		</aside>
	</div>
</section>
