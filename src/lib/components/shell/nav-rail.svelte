<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { appState, SECTIONS, type Section } from "$lib/app-state.svelte";
	import HiveMark from "./hive-mark.svelte";
	import ThemeToggle from "./theme-toggle.svelte";
	import ChatsCircleIcon from "phosphor-svelte/lib/ChatsCircleIcon";
	import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";
	import HardDrivesIcon from "phosphor-svelte/lib/HardDrivesIcon";
	import SquaresFourIcon from "phosphor-svelte/lib/SquaresFourIcon";
	import { cn } from "$lib/utils";

	const ICONS: Record<Section, typeof ChatsCircleIcon> = {
		sessions: ChatsCircleIcon,
		batches: SquaresFourIcon,
		projects: FolderSimpleIcon,
		nodes: HardDrivesIcon,
	};
</script>

<nav aria-label="Sections" class="flex w-14 shrink-0 flex-col items-center gap-1 border-r bg-sidebar py-3">
	<div class="mb-3 flex size-9 items-center justify-center text-primary" title="Hive">
		<HiveMark class="size-7" />
		<span class="sr-only">Hive</span>
	</div>

	{#each SECTIONS as item (item.id)}
		{@const Icon = ICONS[item.id]}
		{@const active = appState.section === item.id}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="icon"
						aria-label={item.label}
						aria-current={active ? "page" : undefined}
						class={cn("relative", active && "bg-sidebar-accent text-foreground")}
						onclick={() => appState.selectSection(item.id)}
					>
						{#if active}
							<span class="absolute inset-y-2 left-0 w-0.5 bg-primary" aria-hidden="true"></span>
						{/if}
						<Icon size={20} aria-hidden="true" />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="right">{item.label}</Tooltip.Content>
		</Tooltip.Root>
	{/each}

	<div class="mt-auto">
		<ThemeToggle />
	</div>
</nav>
