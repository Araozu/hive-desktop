<script lang="ts">
	import { cn } from "$lib/utils";
	import type { MessageResponse } from "$lib/protocol/types";

	let { message, model }: { message: MessageResponse; model: string | null } = $props();

	const isUser = $derived(message.role === "user");
	const checkpoint = $derived(message.status === "checkpoint");
</script>

<article class={cn("flex flex-col gap-1.5", isUser && "border-l-2 border-foreground/80 pl-4")} aria-label={isUser ? "You" : "Assistant"}>
	<p class="flex items-baseline gap-2 text-xs">
		<span class="font-medium text-foreground">{isUser ? "You" : "Assistant"}</span>
		{#if !isUser && model}
			<span class="text-muted-foreground">{model}</span>
		{/if}
	</p>
	<p class="max-w-[68ch] text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
	{#if checkpoint}
		<p class="text-xs text-muted-foreground">Checkpoint. More text may follow.</p>
	{/if}
</article>
