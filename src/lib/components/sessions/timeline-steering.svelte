<script lang="ts">
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { DELIVERY_LABEL, steeringHint } from "$lib/view/delivery";
	import { steeringStatusMeta } from "$lib/status";
	import type { SteeringInstructionResponse } from "$lib/protocol/types";

	let { instruction }: { instruction: SteeringInstructionResponse } = $props();

	const meta = $derived(steeringStatusMeta(instruction.status));
	const hint = $derived(steeringHint(instruction.delivery, instruction.status));
</script>

<div class="flex flex-col gap-1.5 border-l-2 border-border pl-4">
	<p class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
		<span class="font-medium text-foreground">Steering</span>
		<span>{DELIVERY_LABEL[instruction.delivery]}</span>
		<StatusBadge {meta} />
	</p>
	<p class="max-w-[68ch] text-sm leading-relaxed whitespace-pre-wrap">{instruction.text}</p>
	<p class="text-xs text-muted-foreground">{hint}</p>
</div>
