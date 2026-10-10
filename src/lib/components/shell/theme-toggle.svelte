<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { theme } from "$lib/theme.svelte";
	import MoonIcon from "phosphor-svelte/lib/MoonIcon";
	import SunIcon from "phosphor-svelte/lib/SunIcon";

	const label = $derived(theme.dark ? "Switch to light theme" : "Switch to dark theme");
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" aria-label={label} onclick={() => theme.toggle()}>
				{#if theme.dark}
					<SunIcon size={18} aria-hidden="true" />
				{:else}
					<MoonIcon size={18} aria-hidden="true" />
				{/if}
			</Button>
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Content side="right">{label}</Tooltip.Content>
</Tooltip.Root>
