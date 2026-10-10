<script lang="ts">
	import { cn } from "$lib/utils";
	import { toneClasses, type StatusMeta } from "$lib/status";

	let { meta, class: className }: { meta: StatusMeta; class?: string } = $props();

	const tone = $derived(toneClasses(meta.tone));
	const Icon = $derived(meta.icon);
</script>

<span class={cn("inline-flex shrink-0 items-center justify-center", className)} title={meta.label}>
	<Icon size={16} class={cn(tone.icon, meta.spin && "motion-safe:animate-spin")} aria-hidden="true" />
	<span class="sr-only">{meta.label}</span>
</span>
