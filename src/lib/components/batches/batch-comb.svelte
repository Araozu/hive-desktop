<script lang="ts">
	import { cn } from "$lib/utils";
	import { turnStatusMeta, type StatusTone } from "$lib/status";
	import { modelLabel } from "$lib/demo/sample-data";
	import type { BatchMember } from "$lib/view/types";

	let {
		members,
		selectedIndex,
		onselect,
	}: {
		members: BatchMember[];
		selectedIndex: number | null;
		onselect: (index: number) => void;
	} = $props();

	/* Flat-top hexagon. Neighbors share an edge, so the cells read as a comb. */
	const W = 120;
	const H = (Math.sqrt(3) / 2) * W;
	const COLS = 4;
	const POINTS = `${W * 0.25},0 ${W * 0.75},0 ${W},${H / 2} ${W * 0.75},${H} ${W * 0.25},${H} 0,${H / 2}`;

	const SHAPE: Record<StatusTone, { fill: string; stroke: string }> = {
		neutral: { fill: "fill-transparent", stroke: "stroke-muted-foreground" },
		running: { fill: "fill-status-running/20", stroke: "stroke-status-running" },
		success: { fill: "fill-status-success/15", stroke: "stroke-status-success" },
		paused: { fill: "fill-status-paused/15", stroke: "stroke-status-paused" },
		unknown: { fill: "fill-status-unknown/15", stroke: "stroke-status-unknown" },
		failed: { fill: "fill-destructive/10", stroke: "stroke-destructive" },
	};

	const cells = $derived(
		members.map((member, i) => {
			const col = i % COLS;
			const row = Math.floor(i / COLS);
			return {
				member,
				index: member.task.combination_index ?? i,
				x: col * W * 0.75,
				y: row * H + (col % 2 === 1 ? H / 2 : 0),
			};
		}),
	);
	const cols = $derived(Math.min(COLS, members.length));
	const width = $derived(Math.max(W, (cols - 1) * W * 0.75 + W));
	const height = $derived(Math.ceil(members.length / COLS) * H + H / 2);
</script>

<div class="relative" style="width: {width}px; height: {height}px;" role="group" aria-label="Combinations">
	{#each cells as cell, i (cell.member.task.id)}
		{@const meta = turnStatusMeta(cell.member.task.latest_run.turn.status)}
		{@const shape = SHAPE[meta.tone]}
		{@const Icon = meta.icon}
		{@const selected = selectedIndex === cell.index}
		{@const limit = cell.member.task.spec.settings.max_output_tokens}
		<button
			type="button"
			class="comb-cell absolute flex items-center justify-center outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
			style="left: {cell.x}px; top: {cell.y}px; width: {W}px; height: {H}px; --i: {i};"
			aria-pressed={selected}
			aria-label="Combination {cell.index + 1}: {modelLabel(cell.member.task.spec.model)}, {limit ?? 'default'} output tokens, {meta.label}"
			onclick={() => onselect(cell.index)}
		>
			<svg viewBox="0 0 {W} {H}" class="absolute inset-0 size-full overflow-visible" aria-hidden="true" focusable="false">
				<polygon
					points={POINTS}
					class={cn(shape.fill, shape.stroke, selected ? "stroke-ring" : "")}
					stroke-width={selected ? 3 : 1.5}
					stroke-dasharray={meta.tone === "neutral" ? "4 3" : undefined}
					vector-effect="non-scaling-stroke"
				/>
			</svg>
			<span class="relative flex flex-col items-center gap-1 text-center">
				<span class="font-mono text-xs leading-none tabular-nums text-foreground">{String(cell.index + 1).padStart(2, "0")}</span>
				<Icon
					size={16}
					class={cn(
						"shrink-0",
						meta.tone === "neutral" ? "text-muted-foreground" : "",
						meta.tone === "running" && "text-status-running",
						meta.tone === "success" && "text-status-success",
						meta.tone === "paused" && "text-status-paused",
						meta.tone === "unknown" && "text-status-unknown",
						meta.tone === "failed" && "text-destructive",
						meta.spin && "motion-safe:animate-spin",
					)}
					aria-hidden="true"
				/>
			</span>
		</button>
	{/each}
</div>

<style>
	@media (prefers-reduced-motion: no-preference) {
		.comb-cell {
			animation: comb-fill 420ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
			animation-delay: calc(var(--i) * 40ms);
		}
	}

	@keyframes comb-fill {
		from {
			opacity: 0;
			transform: scale(0.88);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
