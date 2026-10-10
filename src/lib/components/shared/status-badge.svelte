<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { cn } from "$lib/utils";
	import { toneClasses, type StatusMeta } from "$lib/status";

	let { meta, class: className }: { meta: StatusMeta; class?: string } = $props();

	const tone = $derived(toneClasses(meta.tone));
	const Icon = $derived(meta.icon);
</script>

<Badge variant="outline" class={cn("gap-1.5 border-transparent px-1.5 text-foreground", tone.tint, className)}>
	<Icon size={13} class={cn("shrink-0", tone.icon, meta.spin && "motion-safe:animate-spin")} aria-hidden="true" />
	<span class="whitespace-nowrap">{meta.label}</span>
</Badge>
