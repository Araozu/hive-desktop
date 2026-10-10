<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { modelLabel } from "$lib/demo/sample-data";
	import { EFFECTS_UNKNOWN, isRetryableTurnStatus, turnStatusMeta } from "$lib/status";
	import { formatCount } from "$lib/view/format";
	import type { BatchMember } from "$lib/view/types";

	let { member, total }: { member: BatchMember | null; total: number } = $props();

	const turn = $derived(member?.task.latest_run.turn ?? null);
	const status = $derived(turn?.status ?? "");
	const retryable = $derived(isRetryableTurnStatus(status));
</script>

{#if member && turn}
	<article class="flex flex-col gap-5" aria-labelledby="cell-heading">
		<header class="flex flex-col gap-2">
			<p class="text-xs text-muted-foreground">
				Combination {(member.task.combination_index ?? 0) + 1} of {total}
			</p>
			<h3 id="cell-heading" class="text-base font-semibold">{modelLabel(member.task.spec.model)}</h3>
			<div class="flex flex-wrap items-center gap-2">
				<StatusBadge meta={turnStatusMeta(status)} />
				{#if member.task.latest_run.effects_unknown}
					<StatusBadge meta={EFFECTS_UNKNOWN} />
				{/if}
			</div>
		</header>

		<dl class="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
			<dt class="text-muted-foreground">Prompt</dt>
			<dd class="leading-relaxed">{member.task.spec.prompt}</dd>

			<dt class="text-muted-foreground">Model</dt>
			<dd class="min-w-0 truncate font-mono text-xs">{member.task.spec.model}</dd>

			<dt class="text-muted-foreground">Output limit</dt>
			<dd class="font-mono text-xs tabular-nums">{formatCount(member.task.spec.settings.max_output_tokens)}</dd>

			<dt class="text-muted-foreground">Run</dt>
			<dd class="min-w-0 truncate font-mono text-xs">{member.task.latest_run.id}</dd>
		</dl>

		{#if member.output}
			<section aria-labelledby="cell-output" class="flex flex-col gap-2">
				<h4 id="cell-output" class="text-sm font-semibold">Output</h4>
				<p class="text-sm leading-relaxed whitespace-pre-wrap">{member.output}</p>
			</section>
		{/if}

		{#if turn.error_message}
			<Alert>
				<AlertTitle>{status === "failed" ? "This combination failed" : "This combination stopped"}</AlertTitle>
				<AlertDescription>
					{turn.error_message}
					{#if turn.error_code}
						<span class="mt-1 block font-mono text-xs">{turn.error_code}</span>
					{/if}
				</AlertDescription>
			</Alert>
		{/if}

		<div class="flex flex-col gap-2 border-t pt-4">
			{#if retryable}
				<Button size="sm" class="self-start" disabled aria-describedby="retry-reason">Retry combination</Button>
				<p id="retry-reason" class="text-xs text-muted-foreground">
					Sample data. Retrying needs a connected node. Only this combination reruns. Completed results stay.
				</p>
			{:else}
				<p class="text-xs text-muted-foreground">
					Retry applies to failed, interrupted, cancelled, or incomplete combinations.
				</p>
			{/if}
		</div>
	</article>
{:else}
	<div class="flex flex-col gap-2">
		<p class="text-sm font-medium">No combination selected</p>
		<p class="text-sm text-muted-foreground">Select a cell to see its prompt, settings, output, and any error.</p>
	</div>
{/if}
