<script lang="ts">
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { turnStatusMeta } from "$lib/status";
	import type { ModelRequestResponse, UsageResponse } from "$lib/protocol/types";

	let { request }: { request: ModelRequestResponse } = $props();

	// Model request statuses (running, completed, failed, cancelled, interrupted) share the turn vocabulary.
	const meta = $derived(turnStatusMeta(request.status));

	function count(value: number | null | undefined): string {
		return value === null || value === undefined ? "Unknown" : value.toLocaleString("en-US");
	}

	function usageOf(u: UsageResponse | null) {
		return { input: count(u?.input_tokens), output: count(u?.output_tokens) };
	}

	const usage = $derived(usageOf(request.usage));
	const finish = $derived(
		request.finish_reason === "tool_calls" ? "Requested tools" : request.finish_reason === "stop" ? "Finished" : null,
	);
</script>

<div class="flex items-center gap-3 text-xs text-muted-foreground">
	<span class="h-px w-3 bg-border" aria-hidden="true"></span>
	<span class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="font-medium text-foreground">Request {request.ordinal}</span>
		<StatusBadge {meta} />
		{#if finish}
			<span>{finish}</span>
		{/if}
		<span>
			Input <span class="font-mono tabular-nums text-foreground">{usage.input}</span>
		</span>
		<span>
			Output <span class="font-mono tabular-nums text-foreground">{usage.output}</span>
		</span>
		{#if request.error_code}
			<span class="font-mono">{request.error_code}</span>
		{/if}
	</span>
	<span class="h-px flex-1 bg-border" aria-hidden="true"></span>
</div>
