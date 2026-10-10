<script lang="ts">
	import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "$lib/components/ui/sheet";
	import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "$lib/components/ui/empty";
	import ListPane from "$lib/components/shared/list-pane.svelte";
	import SheetTitlebar from "$lib/components/shared/sheet-titlebar.svelte";
	import SessionList from "./session-list.svelte";
	import SessionView from "./session-view.svelte";
	import Inspector from "./inspector.svelte";
	import { appState } from "$lib/app-state.svelte";
	import { visibleSessions } from "$lib/demo/sample-data";
	import ChatsCircleIcon from "phosphor-svelte/lib/ChatsCircleIcon";

	const sessions = $derived(visibleSessions(appState.scenario));
	const selected = $derived(sessions.find((s) => s.session.id === appState.sessionId) ?? sessions[0] ?? null);
</script>

<div class="flex min-h-0 min-w-0 flex-1">
	<ListPane label="Sessions">
		<SessionList />
	</ListPane>

	<main class="flex min-h-0 min-w-0 flex-1 flex-col">
		{#if selected}
			<SessionView detail={selected} />
		{:else}
			<div class="flex flex-1 items-center justify-center p-8">
				<Empty class="max-w-md border-0">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ChatsCircleIcon size={22} aria-hidden="true" />
						</EmptyMedia>
						<EmptyTitle>No sessions yet</EmptyTitle>
						<EmptyDescription>
							A session shows one conversation, its tool calls, and any steering. Sessions appear once a connected
							node starts one.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		{/if}
	</main>

	{#if appState.xl && appState.inspectorVisible && selected}
		<div class="flex w-80 shrink-0 flex-col border-l">
			<Inspector detail={selected} />
		</div>
	{/if}

	<Sheet open={!appState.xl && appState.inspectorSheetOpen} onOpenChange={(open) => (appState.inspectorSheetOpen = open)}>
		<SheetContent side="right" showCloseButton={false} class="w-96 gap-0 p-0 sm:max-w-sm">
			<SheetHeader class="sr-only">
				<SheetTitle>Session details</SheetTitle>
				<SheetDescription>Workspace, events, artifacts, and turn details for the selected session.</SheetDescription>
			</SheetHeader>
			<SheetTitlebar title="Session details" />
			{#if selected}
				<div class="flex min-h-0 flex-1 flex-col">
					<Inspector detail={selected} />
				</div>
			{/if}
		</SheetContent>
	</Sheet>
</div>
