<script lang="ts">
	import ListPane from "$lib/components/shared/list-pane.svelte";
	import BatchList from "./batch-list.svelte";
	import BatchView from "./batch-view.svelte";
	import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "$lib/components/ui/empty";
	import { appState } from "$lib/app-state.svelte";
	import { visibleBatches } from "$lib/demo/sample-data";
	import SquaresFourIcon from "phosphor-svelte/lib/SquaresFourIcon";

	const batches = $derived(visibleBatches(appState.scenario));
	const selected = $derived(batches.find((b) => b.batch.id === appState.batchId) ?? batches[0] ?? null);
</script>

<div class="flex min-h-0 min-w-0 flex-1">
	<ListPane label="Batches">
		<BatchList />
	</ListPane>

	{#if selected}
		<BatchView detail={selected} />
	{:else}
		<main class="flex min-h-0 min-w-0 flex-1 items-center justify-center p-8">
			<Empty class="max-w-md border-0">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<SquaresFourIcon size={22} aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>No batches yet</EmptyTitle>
					<EmptyDescription>
						A batch shows each combination as a cell, with its prompt, model, settings, and output.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</main>
	{/if}
</div>
