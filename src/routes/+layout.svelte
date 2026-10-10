<script lang="ts">
	import "./layout.css";
	import { TooltipProvider } from "$lib/components/ui/tooltip";
	import { THEME_STORAGE_KEY, theme } from "$lib/theme.svelte";

	let { children } = $props();

	$effect(() => {
		document.documentElement.classList.toggle("dark", theme.dark);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme.dark ? "dark" : "light");
		} catch {
			// Storage can be unavailable in some webview configurations. The theme still applies.
		}
	});
</script>

<TooltipProvider>
	{@render children()}
</TooltipProvider>
