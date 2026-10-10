<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { sampleNotice } from "$lib/demo/sample-data";
	import { appState } from "$lib/app-state.svelte";
	import { cn } from "$lib/utils";
	import WarningDiamondIcon from "phosphor-svelte/lib/WarningDiamondIcon";
	import CircleDashedIcon from "phosphor-svelte/lib/CircleDashedIcon";

	const notice = $derived(sampleNotice(appState.scenario));
</script>

<div
	role="status"
	class="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed bg-muted/60 px-4 py-1.5 text-sm"
	data-tone={notice.tone}
>
	{#if notice.tone === "offline"}
		<WarningDiamondIcon size={16} class="shrink-0 text-status-unknown" aria-hidden="true" />
	{:else}
		<CircleDashedIcon size={16} class="shrink-0 text-muted-foreground" aria-hidden="true" />
	{/if}
	<p class={cn("min-w-0 flex-1", notice.tone === "offline" && "font-medium")}>
		<span class="font-medium">{notice.title}.</span>
		<span class="text-muted-foreground">{notice.detail}</span>
	</p>
	<Button variant="ghost" size="sm" onclick={() => appState.selectSection("nodes")}>
		Nodes and sample states
	</Button>
</div>
