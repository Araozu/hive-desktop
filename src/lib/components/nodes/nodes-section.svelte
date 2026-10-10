<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { appState } from "$lib/app-state.svelte";
	import { SAMPLE_NODES, type SampleScenario } from "$lib/demo/sample-data";
	import { connectionStatusMeta } from "$lib/status";
	import type { NodeDetail } from "$lib/view/types";
	import PlugsIcon from "phosphor-svelte/lib/PlugsIcon";

	const SCENARIOS: { id: SampleScenario; label: string; hint: string }[] = [
		{ id: "sample", label: "Sample data", hint: "Sessions, batches, and projects from the sample set." },
		{ id: "empty", label: "Empty node", hint: "A node with no sessions, batches, or projects yet." },
		{ id: "offline", label: "Node offline", hint: "The main node is unreachable. Its last known data stays visible." },
	];

	const SCENARIO_IDS = SCENARIOS.map((s) => s.id);
	/** The shadcn toggle selects with `muted`, which is too close to the page. Use the accent token instead. */
	const SELECTED = "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground";
	const activeHint = $derived(SCENARIOS.find((s) => s.id === appState.scenario)?.hint ?? "");

	/** Connection state for each node in the current sample scenario. None is actually connected. */
	function stateOf(node: NodeDetail): string {
		if (appState.scenario === "offline" && node.node.node_id === "node_home_linux") return "unreachable";
		if (node.node.node_id === "node_home_windows") return "inactive";
		return "not-connected";
	}

	function setScenario(value: string) {
		const match = SCENARIO_IDS.find((id) => id === value);
		if (match) appState.scenario = match;
	}
</script>

<main class="flex min-h-0 min-w-0 flex-1 flex-col" aria-labelledby="nodes-heading">
	<header class="flex flex-col gap-4 border-b px-4 py-4 lg:px-6">
		<div class="flex flex-col gap-1">
			<h2 id="nodes-heading" class="text-lg font-semibold tracking-tight">Nodes</h2>
			<p class="max-w-prose text-sm text-muted-foreground">
				Each machine runs one daemon. Hive connects to a node to show and steer its sessions. Nothing here is connected yet.
			</p>
		</div>

		<div class="flex flex-col gap-2">
			<p id="scenario-label" class="text-xs font-medium">Sample state</p>
			<ToggleGroup
				type="single"
				variant="outline"
				size="sm"
				aria-labelledby="scenario-label"
				value={appState.scenario}
				onValueChange={setScenario}
			>
				{#each SCENARIOS as scenario (scenario.id)}
					<ToggleGroupItem value={scenario.id} class={SELECTED}>{scenario.label}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
			<p class="text-xs text-muted-foreground">{activeHint}</p>
		</div>
	</header>

	<div class="min-h-0 flex-1 overflow-y-auto">
		<ul class="flex flex-col divide-y">
			{#each SAMPLE_NODES as node (node.node.node_id)}
				{@const state = stateOf(node)}
				<li class="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-6">
					<div class="flex min-w-0 flex-col gap-1">
						<div class="flex flex-wrap items-center gap-2">
							<h3 class="text-sm font-semibold">{node.node.name}</h3>
							<span class="font-mono text-xs text-muted-foreground">{node.node.os}</span>
							<StatusBadge meta={connectionStatusMeta(state)} />
						</div>
						<p class="text-sm text-muted-foreground">{node.note}</p>
						{#if state === "unreachable"}
							<p class="text-xs text-muted-foreground">Last data received 12 minutes ago. New actions wait for the node.</p>
						{/if}
					</div>
					<div class="flex items-start lg:justify-end">
						<Button variant="outline" size="sm" disabled aria-describedby="connect-reason">
							<PlugsIcon size={14} aria-hidden="true" />
							Connect
						</Button>
					</div>
				</li>
			{/each}
		</ul>

		<Separator />
		<p id="connect-reason" class="px-4 py-4 text-xs text-muted-foreground lg:px-6">
			Connecting needs the daemon client, which is not built yet. Until then, every node stays on sample data.
		</p>
	</div>
</main>
