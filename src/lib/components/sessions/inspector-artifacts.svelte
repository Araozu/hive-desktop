<script lang="ts">
	import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "$lib/components/ui/empty";
	import { formatBytes, shortHash } from "$lib/view/format";
	import type { SessionDetail } from "$lib/view/types";
	import FileTextIcon from "phosphor-svelte/lib/FileTextIcon";

	let { detail }: { detail: SessionDetail } = $props();
</script>

{#if detail.artifacts.length === 0}
	<Empty class="border-0 p-0">
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<FileTextIcon size={20} aria-hidden="true" />
			</EmptyMedia>
			<EmptyTitle>No artifacts yet</EmptyTitle>
			<EmptyDescription>Large outputs and diffs are saved here, with their checksums.</EmptyDescription>
		</EmptyHeader>
	</Empty>
{:else}
	<ul class="flex flex-col divide-y">
		{#each detail.artifacts as ref (ref.artifact.id)}
			<li class="flex flex-col gap-1 py-3">
				<p class="text-sm font-medium">{ref.source_label}</p>
				<p class="text-xs text-muted-foreground">
					<span class="font-mono">{ref.artifact.media_type}</span>
					<span class="tabular-nums">{formatBytes(ref.artifact.size_bytes)}</span>
				</p>
				<p class="font-mono text-xs text-muted-foreground">
					sha256 <span class="text-foreground">{shortHash(ref.artifact.sha256)}</span>
				</p>
			</li>
		{/each}
	</ul>
{/if}
