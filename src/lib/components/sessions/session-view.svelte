<script lang="ts">
	import SessionHeader from "./session-header.svelte";
	import Timeline from "./timeline.svelte";
	import Composer from "./composer.svelte";
	import type { SessionDetail } from "$lib/view/types";

	let { detail }: { detail: SessionDetail } = $props();
</script>

<section aria-label="Session" class="flex min-h-0 min-w-0 flex-1 flex-col">
	<SessionHeader {detail} />
	<Timeline {detail} />
	<Composer />
</section>
