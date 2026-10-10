<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Kbd, KbdGroup } from "$lib/components/ui/kbd";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Select from "$lib/components/ui/select";
	import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
	import { appState } from "$lib/app-state.svelte";
	import { SAMPLE_MODELS } from "$lib/demo/sample-data";
	import type { DeliveryMode } from "$lib/protocol/types";
	import { DELIVERY_HINT, DELIVERY_LABEL } from "$lib/view/delivery";
	import PaperPlaneTiltIcon from "phosphor-svelte/lib/PaperPlaneTiltIcon";

	let draft = $state("");

	const DELIVERY_MODES: DeliveryMode[] = ["after-turn", "next-boundary", "immediate"];
	/** The shadcn toggle selects with `muted`, which is too close to the page. Use the accent token instead. */
	const SELECTED = "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground";

	function modelValue(m: { provider: string; model: string }): string {
		return `${m.provider}/${m.model}`;
	}

	const selectedModel = $derived(SAMPLE_MODELS.find((m) => modelValue(m) === appState.modelId) ?? SAMPLE_MODELS[0]!);

	function setDelivery(value: string) {
		const match = DELIVERY_MODES.find((mode) => mode === value);
		if (match) appState.deliveryMode = match;
	}
</script>

<div class="border-t bg-background px-4 py-3 lg:px-6">
	<form class="mx-auto flex max-w-[760px] flex-col gap-2" onsubmit={(event) => event.preventDefault()}>
		<Label for="composer-input" class="sr-only">Message to the agent</Label>
		<Textarea
			id="composer-input"
			rows={2}
			placeholder="Steer this session. Your draft stays here until a node is connected."
			bind:value={draft}
			class="min-h-16 resize-none"
		/>

		<div class="flex flex-wrap items-center gap-2">
			<ToggleGroup
				type="single"
				size="sm"
				variant="outline"
				aria-label="Delivery mode"
				value={appState.deliveryMode}
				onValueChange={setDelivery}
			>
				{#each DELIVERY_MODES as mode (mode)}
					<ToggleGroupItem value={mode} aria-label={DELIVERY_LABEL[mode]} class={SELECTED}>{DELIVERY_LABEL[mode]}</ToggleGroupItem>
				{/each}
			</ToggleGroup>

			<Select.Root type="single" value={appState.modelId} onValueChange={(v) => (appState.modelId = v)}>
				<Select.Trigger size="sm" class="min-w-40" aria-label="Model">
					<span class="truncate">{selectedModel.display_name}</span>
				</Select.Trigger>
				<Select.Content>
					{#each SAMPLE_MODELS as model (model.id)}
						<Select.Item value={modelValue(model)} label={model.display_name} disabled={!model.ready}>
							{model.display_name}
							{#if !model.ready}
								<span class="text-muted-foreground">({model.reason})</span>
							{/if}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<div class="ml-auto flex items-center gap-2">
				<KbdGroup aria-hidden="true" class="hidden sm:inline-flex">
					<Kbd>Ctrl</Kbd>
					<Kbd>Enter</Kbd>
				</KbdGroup>
				<Button type="submit" size="sm" disabled aria-describedby="composer-reason">
					<PaperPlaneTiltIcon size={14} aria-hidden="true" />
					Send
				</Button>
			</div>
		</div>

		<p id="composer-reason" class="text-xs text-muted-foreground">
			{DELIVERY_HINT[appState.deliveryMode]}
			<span class="text-foreground">Sample data. Sending and turn controls need a connected node.</span>
		</p>
	</form>
</div>
