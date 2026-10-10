<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, EmptyContent } from "$lib/components/ui/empty";
	import { Separator } from "$lib/components/ui/separator";
	import StatusIcon from "$lib/components/shared/status-icon.svelte";
	import { appState } from "$lib/app-state.svelte";
	import { visibleSessions } from "$lib/demo/sample-data";
	import { turnStatusMeta } from "$lib/status";
	import { groupSessions, latestTurnStatus } from "$lib/view/session";
	import { cn } from "$lib/utils";
	import ChatsCircleIcon from "phosphor-svelte/lib/ChatsCircleIcon";
	import MagnifyingGlassIcon from "phosphor-svelte/lib/MagnifyingGlassIcon";
	import PlusIcon from "phosphor-svelte/lib/PlusIcon";

	let query = $state("");

	const all = $derived(visibleSessions(appState.scenario));
	const filtered = $derived(
		all.filter((s) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (s.session.title ?? "").toLowerCase().includes(q) || (s.project_name ?? "").toLowerCase().includes(q);
		}),
	);
	const groups = $derived(groupSessions(filtered));
	const selectedId = $derived(appState.sessionId ?? all[0]?.session.id ?? null);

	function select(id: string) {
		appState.sessionId = id;
		appState.listSheetOpen = false;
	}
</script>

<section aria-labelledby="session-list-heading" class="flex min-h-0 flex-1 flex-col">
	<header class="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
		<h2 id="session-list-heading" class="text-base font-semibold">Sessions</h2>
		<Button size="sm" disabled aria-describedby="new-session-reason">
			<PlusIcon size={14} aria-hidden="true" />
			New session
		</Button>
	</header>

	<div class="px-4 pb-3">
		<div class="relative">
			<MagnifyingGlassIcon size={14} class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
			<Input
				type="search"
				placeholder="Search sessions"
				aria-label="Search sessions"
				bind:value={query}
				class="pl-8"
			/>
		</div>
	</div>

	<Separator />

	{#if all.length === 0}
		<div class="flex flex-1 items-center justify-center p-4">
			<Empty class="border-0 p-2">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<ChatsCircleIcon size={22} aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>No sessions yet</EmptyTitle>
					<EmptyDescription>Sessions appear here once a connected node starts work.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	{:else if groups.length === 0}
		<div class="p-4 text-sm text-muted-foreground">
			No sessions match “{query.trim()}”.
			<Button variant="link" size="sm" class="px-1" onclick={() => (query = "")}>Clear search</Button>
		</div>
	{:else}
		<div class="min-h-0 flex-1 overflow-y-auto py-2">
			{#each groups as group (group.id)}
				<section aria-labelledby="session-group-{group.id}" class="mb-2">
					<h3 id="session-group-{group.id}" class="px-4 pt-2 pb-1 text-xs font-medium text-muted-foreground">
						{group.label}
					</h3>
					<ul class="flex flex-col">
						{#each group.items as item (item.session.id)}
							{@const meta = turnStatusMeta(latestTurnStatus(item))}
							{@const selected = selectedId === item.session.id}
							<li>
								<button
									type="button"
									aria-current={selected ? "true" : undefined}
									onclick={() => select(item.session.id)}
									class={cn(
										"flex w-full min-w-0 items-start gap-3 px-4 py-2 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
										selected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
									)}
								>
									<StatusIcon {meta} class="mt-0.5" />
									<span class="flex min-w-0 flex-1 flex-col gap-0.5">
										<span class="truncate text-sm font-medium">{item.session.title ?? "Untitled session"}</span>
										<span class="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
											<span class="truncate">{item.project_name ?? "No project"}</span>
											<span class="shrink-0">{item.updated_label}</span>
										</span>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	{/if}

	<footer class="border-t px-4 py-3 text-xs text-muted-foreground" id="new-session-reason">
		Sample data. New sessions need a connected node.
	</footer>
</section>
