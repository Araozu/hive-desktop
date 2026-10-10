<script lang="ts">
	import ListPane from "$lib/components/shared/list-pane.svelte";
	import ProjectList from "./project-list.svelte";
	import ProjectView from "./project-view.svelte";
	import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "$lib/components/ui/empty";
	import { appState } from "$lib/app-state.svelte";
	import { visibleProjects } from "$lib/demo/sample-data";
	import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";

	const projects = $derived(visibleProjects(appState.scenario));
	const selected = $derived(projects.find((p) => p.project.id === appState.projectId) ?? projects[0] ?? null);
</script>

<div class="flex min-h-0 min-w-0 flex-1">
	<ListPane label="Projects">
		<ProjectList />
	</ListPane>

	{#if selected}
		<ProjectView detail={selected} />
	{:else}
		<main class="flex min-h-0 min-w-0 flex-1 items-center justify-center p-8">
			<Empty class="max-w-md border-0">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<FolderSimpleIcon size={22} aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>No projects yet</EmptyTitle>
					<EmptyDescription>
						A project is a Git repository registered on a node. Sessions in a project get their own worktrees, so
						parallel edits stay separate.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</main>
	{/if}
</div>
