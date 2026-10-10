<script lang="ts">
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { modelLabel } from "$lib/demo/sample-data";
	import { turnStatusMeta } from "$lib/status";
	import type { TurnResponse } from "$lib/protocol/types";

	let { turn, ordinal }: { turn: TurnResponse; ordinal: number } = $props();

	const meta = $derived(turnStatusMeta(turn.status));
</script>

<div class="flex flex-col gap-1.5">
	<div class="flex items-center gap-3 text-xs text-muted-foreground">
		<span class="h-px flex-1 bg-border" aria-hidden="true"></span>
		<span class="flex shrink-0 items-center gap-2">
			<span class="font-medium text-foreground">Turn {ordinal}</span>
			<StatusBadge {meta} />
			<span>{modelLabel(turn.requested_model)}</span>
		</span>
		<span class="h-px flex-1 bg-border" aria-hidden="true"></span>
	</div>
	{#if turn.error_message || turn.status === "interrupted"}
		<p class="text-center text-xs leading-5 text-muted-foreground">
			{turn.error_message ?? ""}
			{#if turn.status === "interrupted"}
				Nothing was replayed. Send a new message to continue.
			{/if}
		</p>
	{/if}
</div>
