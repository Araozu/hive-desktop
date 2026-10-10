<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";
	import { appState, type InspectorTab } from "$lib/app-state.svelte";
	import InspectorWorkspace from "./inspector-workspace.svelte";
	import InspectorEvents from "./inspector-events.svelte";
	import InspectorArtifacts from "./inspector-artifacts.svelte";
	import InspectorTurn from "./inspector-turn.svelte";
	import type { SessionDetail } from "$lib/view/types";

	let { detail }: { detail: SessionDetail } = $props();

	const TABS: { id: InspectorTab; label: string }[] = [
		{ id: "workspace", label: "Workspace" },
		{ id: "events", label: "Events" },
		{ id: "artifacts", label: "Artifacts" },
		{ id: "turn", label: "Turn" },
	];

	function setTab(value: string) {
		const match = TABS.find((t) => t.id === value);
		if (match) appState.inspectorTab = match.id;
	}
</script>

<aside aria-label="Session details" class="flex h-full min-h-0 flex-col">
	<Tabs.Root value={appState.inspectorTab} onValueChange={setTab} class="flex min-h-0 flex-1 flex-col gap-0">
		<div class="border-b px-3 pt-2">
			<Tabs.List class="w-full">
				{#each TABS as tab (tab.id)}
					<Tabs.Trigger value={tab.id}>{tab.label}</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</div>
		<Tabs.Content value="workspace" class="min-h-0 flex-1 overflow-y-auto p-4">
			<InspectorWorkspace {detail} />
		</Tabs.Content>
		<Tabs.Content value="events" class="min-h-0 flex-1 overflow-y-auto p-4">
			<InspectorEvents {detail} />
		</Tabs.Content>
		<Tabs.Content value="artifacts" class="min-h-0 flex-1 overflow-y-auto p-4">
			<InspectorArtifacts {detail} />
		</Tabs.Content>
		<Tabs.Content value="turn" class="min-h-0 flex-1 overflow-y-auto p-4">
			<InspectorTurn {detail} />
		</Tabs.Content>
	</Tabs.Root>
</aside>
