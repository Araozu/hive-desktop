<script lang="ts">
	import { appState, observeViewport } from "$lib/app-state.svelte";
	import NavRail from "$lib/components/shell/nav-rail.svelte";
	import SampleNotice from "$lib/components/shell/sample-notice.svelte";
	import SessionsSection from "$lib/components/sessions/sessions-section.svelte";
	import BatchesSection from "$lib/components/batches/batches-section.svelte";
	import ProjectsSection from "$lib/components/projects/projects-section.svelte";
	import NodesSection from "$lib/components/nodes/nodes-section.svelte";

	$effect(() => observeViewport());
</script>

<svelte:head>
	<title>Hive</title>
	<meta name="description" content="Hive desktop client for Slop Conductor daemons. Shows sample data until a node is connected." />
</svelte:head>

<div class="flex h-dvh min-w-0 flex-col bg-background text-foreground text-sm">
	<SampleNotice />
	<div class="flex min-h-0 min-w-0 flex-1">
		<NavRail />
		{#if appState.section === "sessions"}
			<SessionsSection />
		{:else if appState.section === "batches"}
			<BatchesSection />
		{:else if appState.section === "projects"}
			<ProjectsSection />
		{:else}
			<NodesSection />
		{/if}
	</div>
</div>
