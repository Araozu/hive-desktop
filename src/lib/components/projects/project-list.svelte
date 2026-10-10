<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { appState } from "$lib/app-state.svelte";
	import { visibleProjects } from "$lib/demo/sample-data";
	import { cn } from "$lib/utils";
	import PlusIcon from "phosphor-svelte/lib/PlusIcon";

	const projects = $derived(visibleProjects(appState.scenario));
	const selectedId = $derived(appState.projectId ?? projects[0]?.project.id ?? null);

	function select(id: string) {
		appState.projectId = id;
		appState.listSheetOpen = false;
	}
</script>

<section aria-labelledby="project-list-heading" class="flex min-h-0 flex-1 flex-col">
	<header class="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
		<h2 id="project-list-heading" class="text-base font-semibold">Projects</h2>
		<Button size="sm" variant="outline" disabled aria-describedby="project-add-reason">
			<PlusIcon size={14} aria-hidden="true" />
			Add project
		</Button>
	</header>

	<Separator />

	{#if projects.length === 0}
		<div class="flex flex-1 flex-col gap-2 p-4">
			<p class="text-sm font-medium">No projects yet</p>
			<p class="text-sm text-muted-foreground">Register a Git repository on a node to start project work.</p>
		</div>
	{:else}
		<ul class="min-h-0 flex-1 overflow-y-auto py-2">
			{#each projects as detail (detail.project.id)}
				{@const selected = selectedId === detail.project.id}
				<li>
					<button
						type="button"
						aria-current={selected ? "true" : undefined}
						onclick={() => select(detail.project.id)}
						class={cn(
							"flex w-full min-w-0 flex-col gap-0.5 px-4 py-2.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
							selected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
						)}
					>
						<span class="truncate text-sm font-medium">{detail.name}</span>
						<span class="truncate font-mono text-xs text-muted-foreground">{detail.project.path}</span>
						<span class="text-xs tabular-nums text-muted-foreground">
							{detail.workspaces.length} {detail.workspaces.length === 1 ? "workspace" : "workspaces"}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<footer class="border-t px-4 py-3 text-xs text-muted-foreground" id="project-add-reason">
		Sample data. Projects are registered on a connected node.
	</footer>
</section>
