<script lang="ts">
	import { untrack } from "svelte";
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "$lib/components/ui/collapsible";
	import StatusBadge from "$lib/components/shared/status-badge.svelte";
	import { cn } from "$lib/utils";
	import { EFFECTS_UNKNOWN, toolStatusMeta } from "$lib/status";
	import type { ToolInvocationResponse } from "$lib/protocol/types";
	import CaretDownIcon from "phosphor-svelte/lib/CaretDownIcon";
	import CubeIcon from "phosphor-svelte/lib/CubeIcon";
	import FileTextIcon from "phosphor-svelte/lib/FileTextIcon";
	import FilePlusIcon from "phosphor-svelte/lib/FilePlusIcon";
	import PencilSimpleIcon from "phosphor-svelte/lib/PencilSimpleIcon";
	import TerminalIcon from "phosphor-svelte/lib/TerminalIcon";

	let { invocation }: { invocation: ToolInvocationResponse } = $props();

	type Replacement = { oldText: string; newText: string };

	/* Tool arguments are untrusted JSON. Read them through guards, never casts. */
	function text(value: unknown): string | null {
		return typeof value === "string" ? value : null;
	}

	function replacements(value: unknown): Replacement[] {
		if (!Array.isArray(value)) return [];
		const out: Replacement[] = [];
		for (const item of value) {
			if (item && typeof item === "object") {
				const oldText = text((item as Record<string, unknown>).oldText);
				const newText = text((item as Record<string, unknown>).newText);
				if (oldText !== null && newText !== null) out.push({ oldText, newText });
			}
		}
		return out;
	}

	const ICONS = {
		read: FileTextIcon,
		write: FilePlusIcon,
		edit: PencilSimpleIcon,
		bash: TerminalIcon,
	} as const;
	const VERBS: Record<string, string> = {
		read: "Read file",
		write: "Write file",
		edit: "Edit file",
		bash: "Run command",
	};

	const Icon = $derived(ICONS[invocation.name as keyof typeof ICONS] ?? CubeIcon);
	const verb = $derived(VERBS[invocation.name] ?? invocation.name);
	const meta = $derived(toolStatusMeta(invocation.status));
	const path = $derived(text(invocation.arguments.path));
	const command = $derived(text(invocation.arguments.command));
	const summary = $derived(invocation.name === "bash" ? (command ?? "") : (path ?? ""));
	const edits = $derived(replacements(invocation.arguments.edits));

	const outputCaption = $derived(
		invocation.status === "running"
			? "Output so far. The command is still running."
			: invocation.name === "bash"
				? "Output. Limited to 1 MB per call."
				: invocation.name === "read"
					? "File content."
					: "Output.",
	);

	// Running, failed, and uncertain tools open by default so the reason is visible.
	let expanded = $state(
		untrack(
			() =>
				invocation.status === "running" ||
				invocation.status === "failed" ||
				invocation.status === "interrupted" ||
				invocation.effects_unknown,
		),
	);
</script>

<Collapsible bind:open={expanded}>
	<div class={cn("border", invocation.effects_unknown ? "border-status-unknown/60" : "border-border", "bg-card")}>
		<CollapsibleTrigger
			class="flex w-full min-w-0 items-center gap-3 px-3 py-2 text-left outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
		>
			<Icon size={16} class="shrink-0 text-muted-foreground" aria-hidden="true" />
			<span class="shrink-0 text-sm font-medium">{verb}</span>
			<span class="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{summary}</span>
			{#if invocation.effects_unknown}
				<StatusBadge meta={EFFECTS_UNKNOWN} />
			{/if}
			<StatusBadge {meta} />
			<CaretDownIcon size={14} class={cn("shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} aria-hidden="true" />
		</CollapsibleTrigger>

		<CollapsibleContent>
			<div class="flex flex-col gap-3 border-t px-3 py-3">
				{#if edits.length > 0}
					<div class="flex flex-col gap-3">
						{#each edits as edit, i (i)}
							<div class="flex flex-col gap-1">
								<p class="text-xs text-muted-foreground">
									Replacement {i + 1} of {edits.length}
								</p>
								<pre class="max-h-40 overflow-auto border-l-2 border-destructive px-3 py-1 font-mono text-xs leading-5 whitespace-pre-wrap">{edit.oldText}</pre>
								<pre class="max-h-40 overflow-auto border-l-2 border-status-success px-3 py-1 font-mono text-xs leading-5 whitespace-pre-wrap">{edit.newText}</pre>
							</div>
						{/each}
					</div>
				{/if}

				{#if invocation.output !== null}
					<div class="flex flex-col gap-1">
						<p class="text-xs text-muted-foreground">{outputCaption}</p>
						<pre class="max-h-56 overflow-auto bg-muted px-3 py-2 font-mono text-xs leading-5 whitespace-pre">{invocation.output}</pre>
					</div>
				{:else}
					<p class="text-xs text-muted-foreground">No output yet.</p>
				{/if}

				{#if invocation.effects_unknown}
					<div class="flex flex-col gap-1 border-l-2 border-status-unknown pl-3">
						<p class="text-sm font-medium">Effects unknown</p>
						<p class="text-xs leading-5 text-muted-foreground">
							The command stopped before its outcome was recorded. It may have changed files or sent data.
							It was not replayed. The agent decides the next step.
						</p>
					</div>
				{/if}

				{#if invocation.error_code}
					<p class="font-mono text-xs text-muted-foreground">Error code {invocation.error_code}</p>
				{/if}

				{#if invocation.artifact_ids.length > 0}
					<p class="text-xs text-muted-foreground">
						Saved as
						{#each invocation.artifact_ids as id (id)}
							<span class="font-mono text-foreground">{id}</span>
						{/each}
					</p>
				{/if}
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
