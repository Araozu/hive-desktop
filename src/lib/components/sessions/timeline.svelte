<script lang="ts">
	import TimelineTurn from "./timeline-turn.svelte";
	import TimelineMessage from "./timeline-message.svelte";
	import TimelineRequest from "./timeline-request.svelte";
	import TimelineTool from "./timeline-tool.svelte";
	import TimelineSteering from "./timeline-steering.svelte";
	import { modelLabel } from "$lib/demo/sample-data";
	import type { SessionDetail, TimelineItem } from "$lib/view/types";

	let { detail }: { detail: SessionDetail } = $props();

	let scroller = $state<HTMLElement | null>(null);

	function keyOf(item: TimelineItem): string {
		switch (item.kind) {
			case "turn":
				return `turn:${item.turn.id}`;
			case "message":
				return `message:${item.message.id}`;
			case "request":
				return `request:${item.request.id}`;
			case "tool":
				return `tool:${item.invocation.id}`;
			case "steering":
				return `steering:${item.instruction.id}`;
		}
	}

	function turnOrdinal(turnId: string): number {
		return detail.turns.findIndex((t) => t.id === turnId) + 1;
	}

	function modelFor(turnId: string): string | null {
		const turn = detail.turns.find((t) => t.id === turnId);
		return turn ? modelLabel(turn.requested_model) : null;
	}

	// Start at the latest entry when the user opens a session. Later updates keep the user's position.
	$effect(() => {
		void detail.session.id;
		const el = scroller;
		if (el) queueMicrotask(() => (el.scrollTop = el.scrollHeight));
	});
</script>

<section bind:this={scroller} class="min-h-0 flex-1 overflow-y-auto" aria-label="Session timeline">
	<ol class="mx-auto flex max-w-[760px] flex-col gap-5 px-4 py-6 lg:px-6">
		{#each detail.timeline as item (keyOf(item))}
			<li>
				{#if item.kind === "turn"}
					<TimelineTurn turn={item.turn} ordinal={turnOrdinal(item.turn.id)} />
				{:else if item.kind === "message"}
					<TimelineMessage message={item.message} model={item.message.role === "user" ? null : modelFor(item.message.turn_id)} />
				{:else if item.kind === "request"}
					<TimelineRequest request={item.request} />
				{:else if item.kind === "tool"}
					<TimelineTool invocation={item.invocation} />
				{:else}
					<TimelineSteering instruction={item.instruction} />
				{/if}
			</li>
		{/each}
	</ol>
</section>
