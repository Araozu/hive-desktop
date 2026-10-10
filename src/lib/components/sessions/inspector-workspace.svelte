<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
	import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "$lib/components/ui/empty";
	import { Separator } from "$lib/components/ui/separator";
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { workspaceStatusMeta } from "$lib/status";
	import type { SessionDetail } from "$lib/view/types";
	import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";

	let { detail }: { detail: SessionDetail } = $props();

	const ws = $derived(detail.workspace);
	const diff = $derived(detail.diff);
	const added = $derived(diff?.files.reduce((sum, f) => sum + f.added, 0) ?? 0);
	const removed = $derived(diff?.files.reduce((sum, f) => sum + f.removed, 0) ?? 0);
</script>

{#if !ws}
	<Empty class="border-0 p-0">
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<FolderSimpleIcon size={20} aria-hidden="true" />
			</EmptyMedia>
			<EmptyTitle>No workspace</EmptyTitle>
			<EmptyDescription>This session has no project, so it has no files to change.</EmptyDescription>
		</EmptyHeader>
	</Empty>
{:else}
	<div class="flex flex-col gap-5">
		<dl class="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm">
			<dt class="text-muted-foreground">Project</dt>
			<dd class="min-w-0 truncate">{detail.project_name ?? "None"}</dd>

			<dt class="text-muted-foreground">Status</dt>
			<dd><StatusBadge meta={workspaceStatusMeta(ws.status)} /></dd>

			<dt class="text-muted-foreground">Workspace</dt>
			<dd class="font-mono text-xs">{ws.id}</dd>

			<dt class="text-muted-foreground">Base commit</dt>
			<dd class="font-mono text-xs">{ws.base_commit}</dd>

			<dt class="text-muted-foreground">Path</dt>
			<dd class="font-mono text-xs break-all">{ws.path}</dd>
		</dl>

		{#if ws.effects_unknown}
			<Alert class="border-status-unknown/60">
				<AlertTitle>Effects unknown</AlertTitle>
				<AlertDescription>
					Git stopped while this worktree was being created. Check the folder before reusing it.
				</AlertDescription>
			</Alert>
		{/if}

		<Separator />

		<section aria-labelledby="changed-files-heading" class="flex flex-col gap-2">
			<h3 id="changed-files-heading" class="text-sm font-semibold">Changed files</h3>
			{#if diff && diff.files.length > 0}
				<p class="text-xs text-muted-foreground">
					{diff.files.length} {diff.files.length === 1 ? "file" : "files"} since {diff.base_commit}
				</p>
				<ul class="flex flex-col divide-y">
					{#each diff.files as file (file.path)}
						<li class="flex min-w-0 items-center gap-3 py-2 text-xs">
							<span class="min-w-0 flex-1 truncate font-mono">{file.path}</span>
							<span class="shrink-0 font-mono tabular-nums">
								<span aria-label="{file.added} added">+{file.added}</span>
								<span class="text-muted-foreground" aria-label="{file.removed} removed">−{file.removed}</span>
							</span>
						</li>
					{/each}
				</ul>
				<p class="font-mono text-xs tabular-nums text-muted-foreground">+{added} −{removed} in total</p>
			{:else}
				<p class="text-sm text-muted-foreground">No changes since the base commit.</p>
			{/if}
		</section>
	</div>
{/if}
