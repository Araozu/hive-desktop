<script lang="ts">
	import type { SessionDetail } from "$lib/view/types";

	let { detail }: { detail: SessionDetail } = $props();

	// Newest events last, matching the order the daemon replays them.
	const events = $derived([...detail.events].sort((a, b) => a.sequence - b.sequence));
</script>

<div class="flex flex-col gap-3">
	<p class="text-xs text-muted-foreground">
		Durable events, through sequence
		<span class="font-mono tabular-nums text-foreground">{detail.session.last_event_sequence}</span>.
		Streamed text is transient and not listed here.
	</p>

	{#if events.length === 0}
		<p class="text-sm text-muted-foreground">No events recorded yet.</p>
	{:else}
		<ol class="flex flex-col divide-y" aria-label="Durable events">
			{#each events as event (event.sequence)}
				<li class="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 py-2 text-xs">
					<span class="font-mono tabular-nums text-muted-foreground">{event.sequence}</span>
					<span class="min-w-0">
						<span class="block truncate font-mono text-foreground">{event.kind}</span>
						{#if event.turn_id}
							<span class="block truncate font-mono text-muted-foreground">{event.turn_id}</span>
						{/if}
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</div>
