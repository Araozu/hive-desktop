<script lang="ts">
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { Separator } from "$lib/components/ui/separator";
	import { modelLabel } from "$lib/demo/sample-data";
	import { turnStatusMeta } from "$lib/status";
	import { formatCount } from "$lib/view/format";
	import type { SessionDetail } from "$lib/view/types";

	let { detail }: { detail: SessionDetail } = $props();

	// Newest turn first, so the active work is at the top.
	const turns = $derived([...detail.turns].reverse());

	function requestsFor(turnId: string) {
		return detail.timeline.flatMap((item) => (item.kind === "request" && item.request.turn_id === turnId ? [item.request] : []));
	}
</script>

<div class="flex flex-col gap-6">
	{#each turns as turn, index (turn.id)}
		{@const ordinal = detail.turns.length - index}
		{@const requests = requestsFor(turn.id)}
		<section aria-labelledby="turn-heading-{turn.id}" class="flex flex-col gap-3">
			<div class="flex items-center gap-2">
				<h3 id="turn-heading-{turn.id}" class="text-sm font-semibold">Turn {ordinal}</h3>
				<StatusBadge meta={turnStatusMeta(turn.status)} />
			</div>

			<dl class="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs">
				<dt class="text-muted-foreground">Requested</dt>
				<dd class="min-w-0 truncate font-mono">{turn.requested_model}</dd>

				<dt class="text-muted-foreground">Resolved</dt>
				<dd class="min-w-0 truncate font-mono">{turn.resolved_model ?? "Unknown"}</dd>

				<dt class="text-muted-foreground">Output limit</dt>
				<dd class="font-mono tabular-nums">{formatCount(turn.settings.max_output_tokens)}</dd>

				<dt class="text-muted-foreground">Reasoning</dt>
				<dd>Provider default. No model accepts an override yet.</dd>

				<dt class="text-muted-foreground">Input tokens</dt>
				<dd class="font-mono tabular-nums">{formatCount(turn.usage?.input_tokens)}</dd>

				<dt class="text-muted-foreground">Output tokens</dt>
				<dd class="font-mono tabular-nums">{formatCount(turn.usage?.output_tokens)}</dd>

				<dt class="text-muted-foreground">Total tokens</dt>
				<dd class="font-mono tabular-nums">{formatCount(turn.usage?.total_tokens)}</dd>
			</dl>

			{#if turn.error_message}
				<p class="text-xs text-muted-foreground">{turn.error_message}</p>
			{/if}

			{#if requests.length > 0}
				<div class="flex flex-col gap-1">
					<p class="text-xs font-medium">Model requests</p>
					<ul class="flex flex-col divide-y text-xs">
						{#each requests as request (request.id)}
							<li class="flex items-center justify-between gap-3 py-1.5">
								<span>Request {request.ordinal}</span>
								<span class="font-mono tabular-nums text-muted-foreground">
									{modelLabel(request.requested_model)}
								</span>
								<span class="font-mono tabular-nums">{formatCount(request.usage?.input_tokens)} in</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			<Separator />
		</section>
	{/each}
</div>
