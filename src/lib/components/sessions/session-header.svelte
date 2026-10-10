<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { appState } from "$lib/app-state.svelte";
	import { modelLabel, SAMPLE_NODES } from "$lib/demo/sample-data";
	import { turnStatusMeta } from "$lib/status";
	import { latestTurnStatus } from "$lib/view/session";
	import type { SessionDetail } from "$lib/view/types";
	import PauseIcon from "phosphor-svelte/lib/PauseIcon";
	import PlayIcon from "phosphor-svelte/lib/PlayIcon";
	import SidebarSimpleIcon from "phosphor-svelte/lib/SidebarSimpleIcon";
	import StopIcon from "phosphor-svelte/lib/StopIcon";

	let { detail }: { detail: SessionDetail } = $props();

	const status = $derived(latestTurnStatus(detail));
	const meta = $derived(turnStatusMeta(status));
	const nodeName = $derived(SAMPLE_NODES.find((n) => n.node.node_id === detail.session.owner_node_id)?.node.name ?? detail.session.owner_node_id);
	const isActive = $derived(status === "running" || status === "queued");
	const isPaused = $derived(status === "paused");
</script>

<header class="flex flex-col gap-3 border-b px-4 py-3 lg:px-6">
	<div class="flex min-w-0 items-start gap-3">
		<Button
			variant="ghost"
			size="icon-sm"
			class="mt-0.5 shrink-0 lg:hidden"
			aria-label="Show sessions"
			onclick={() => appState.toggleList()}
		>
			<SidebarSimpleIcon size={18} aria-hidden="true" />
		</Button>

		<div class="min-w-0 flex-1">
			<div class="flex min-w-0 flex-wrap items-center gap-2">
				<h2 class="min-w-0 truncate text-lg font-semibold tracking-tight">
					{detail.session.title ?? "Untitled session"}
				</h2>
				<StatusBadge {meta} />
			</div>
			<dl class="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
				<div class="flex min-w-0 gap-1.5">
					<dt class="text-muted-foreground">Project</dt>
					<dd class="truncate">{detail.project_name ?? "None"}</dd>
				</div>
				<div class="flex min-w-0 gap-1.5">
					<dt class="text-muted-foreground">Workspace</dt>
					<dd class="font-mono">{detail.workspace?.id ?? "None"}</dd>
				</div>
				{#if detail.workspace}
					<div class="flex min-w-0 gap-1.5">
						<dt class="text-muted-foreground">Base</dt>
						<dd class="font-mono">{detail.workspace.base_commit}</dd>
					</div>
				{/if}
				<div class="flex min-w-0 gap-1.5">
					<dt class="text-muted-foreground">Node</dt>
					<dd class="truncate">{nodeName}</dd>
				</div>
				<div class="flex min-w-0 gap-1.5">
					<dt class="text-muted-foreground">Model</dt>
					<dd class="truncate">{modelLabel(detail.session.model)}</dd>
				</div>
			</dl>
		</div>

		<div class="flex shrink-0 items-center gap-1">
			{#if isActive}
				<Button variant="outline" size="sm" disabled aria-describedby="composer-reason">
					<PauseIcon size={14} aria-hidden="true" />
					Pause turn
				</Button>
				<Button variant="ghost" size="sm" class="text-destructive" disabled aria-describedby="composer-reason">
					<StopIcon size={14} aria-hidden="true" />
					Cancel turn
				</Button>
			{:else if isPaused}
				<Button variant="outline" size="sm" disabled aria-describedby="composer-reason">
					<PlayIcon size={14} aria-hidden="true" />
					Resume turn
				</Button>
			{/if}
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={appState.xl ? (appState.inspectorVisible ? "Hide inspector" : "Show inspector") : "Show inspector"}
				aria-expanded={appState.xl ? appState.inspectorVisible : appState.inspectorSheetOpen}
				onclick={() => appState.toggleInspector()}
			>
				<SidebarSimpleIcon size={18} class="-scale-x-100" aria-hidden="true" />
			</Button>
		</div>
	</div>
</header>
