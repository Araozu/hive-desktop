<script lang="ts">
	import { cn } from "$lib/utils";

	let { class: className }: { class?: string } = $props();

	/** Flat-top hexagon points around a center, for a three-cell comb mark. */
	function hex(cx: number, cy: number, r: number): string {
		const h = (Math.sqrt(3) / 2) * r;
		const points: [number, number][] = [
			[cx + r, cy],
			[cx + r / 2, cy + h],
			[cx - r / 2, cy + h],
			[cx - r, cy],
			[cx - r / 2, cy - h],
			[cx + r / 2, cy - h],
		];
		return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
	}

	const R = 4.6;
	const cells = [hex(12.25, 11.67, R), hex(19.75, 16, R), hex(12.25, 20.33, R)];
</script>

<svg viewBox="0 0 32 32" class={cn("size-6", className)} aria-hidden="true" focusable="false">
	{#each cells as points, i (i)}
		<polygon {points} fill="currentColor" />
	{/each}
</svg>
