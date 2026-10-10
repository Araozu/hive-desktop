<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import { Button } from "$lib/components/ui/button";
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { appState } from "$lib/app-state.svelte";
	import { workspaceStatusMeta } from "$lib/status";
	import { formatCount } from "$lib/view/format";
	import type { ProjectDetail } from "$lib/view/types";
	import SidebarSimpleIcon from "phosphor-svelte/lib/SidebarSimpleIcon";

	let { detail }: { detail: ProjectDetail } = $props();

	function changes(diff: ProjectDetail["workspaces"][number]["diff"]): string {
		if (!diff || diff.files.length === 0) return "No changes";
		const added = diff.files.reduce((s, f) => s + f.added, 0);
		const removed = diff.files.reduce((s, f) => s + f.removed, 0);
		return `+${added} −${removed}, ${diff.files.length} ${diff.files.length === 1 ? "file" : "files"}`;
	}
</script>

<main class="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="Project">
	<header class="flex flex-col gap-3 border-b px-4 py-3 lg:px-6">
		<div class="flex items-start gap-3">
			<Button
				variant="ghost"
				size="icon-sm"
				class="mt-0.5 shrink-0 lg:hidden"
				aria-label="Show projects"
				onclick={() => appState.toggleList()}
			>
				<SidebarSimpleIcon size={18} aria-hidden="true" />
			</Button>
			<div class="min-w-0 flex-1">
				<h2 class="truncate text-lg font-semibold tracking-tight">{detail.name}</h2>
				<dl class="mt-1.5 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
					<dt class="text-muted-foreground">Path</dt>
					<dd class="min-w-0 truncate font-mono">{detail.project.path}</dd>
					<dt class="text-muted-foreground">Git directory</dt>
					<dd class="min-w-0 truncate font-mono">{detail.project.git_common_dir}</dd>
				</dl>
			</div>
		</div>
	</header>

	<div class="min-h-0 flex-1 overflow-auto p-4 lg:p-6">
		<section aria-labelledby="workspaces-heading" class="flex flex-col gap-3">
			<div class="flex items-baseline justify-between gap-3">
				<h3 id="workspaces-heading" class="text-sm font-semibold">Workspaces</h3>
				<p class="text-xs text-muted-foreground tabular-nums">
					{formatCount(detail.workspaces.length)} {detail.workspaces.length === 1 ? "workspace" : "workspaces"}
				</p>
			</div>

			{#if detail.workspaces.length === 0}
				<p class="text-sm text-muted-foreground">No workspaces. Sessions in this project allocate one on their first turn.</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Session</Table.Head>
							<Table.Head>Workspace</Table.Head>
							<Table.Head>Base</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Changes</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each detail.workspaces as row (row.workspace.id)}
							<Table.Row>
								<Table.Cell class="max-w-56">
									<span class="block truncate font-medium">{row.session_title}</span>
								</Table.Cell>
								<Table.Cell class="font-mono text-xs">{row.workspace.id}</Table.Cell>
								<Table.Cell class="font-mono text-xs">{row.workspace.base_commit}</Table.Cell>
								<Table.Cell>
									<StatusBadge meta={workspaceStatusMeta(row.workspace.status)} />
								</Table.Cell>
								<Table.Cell class="text-xs tabular-nums whitespace-nowrap">{changes(row.diff)}</Table.Cell>
							</Table.Row>
							{#if row.workspace.error_code}
								<Table.Row class="hover:bg-transparent">
									<Table.Cell colspan={5} class="whitespace-normal pt-0 text-xs text-muted-foreground">
										<span class="font-mono">{row.workspace.error_code}</span>.
										{#if row.workspace.effects_unknown}
											Effects unknown. Check the folder before reusing it.
										{:else}
											The worktree was not created.
										{/if}
									</Table.Cell>
								</Table.Row>
							{/if}
						{/each}
					</Table.Body>
				</Table.Root>
				<p class="text-xs text-muted-foreground">
					Removing a workspace needs a connected node. The node checks for uncommitted files before it removes anything.
				</p>
			{/if}
		</section>
	</div>
</main>
