<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Alert, AlertDescription } from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import { SAMPLE_MODELS } from "$lib/demo/sample-data";
	import { MAX_MATRIX_MEMBERS, previewMatrix } from "$lib/view/batch-matrix";
	import PlusIcon from "phosphor-svelte/lib/PlusIcon";
	import WarningIcon from "phosphor-svelte/lib/WarningIcon";

	let open = $state(false);
	let name = $state("");
	let promptsText = $state("");
	let limitsText = $state("4096");
	let modelIds = $state<string[]>(["opencode-go/glm-5.3-flash"]);

	const modelValue = (m: { provider: string; model: string }) => `${m.provider}/${m.model}`;

	const preview = $derived(
		previewMatrix({
			name,
			prompts: promptsText.split("\n"),
			modelIds,
			outputLimitsText: limitsText,
		}),
	);

	function toggleModel(value: string, checked: boolean) {
		modelIds = checked ? [...modelIds.filter((m) => m !== value), value] : modelIds.filter((m) => m !== value);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} size="sm">
				<PlusIcon size={14} aria-hidden="true" />
				New batch
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>New batch</Dialog.Title>
			<Dialog.Description>
				Preview the combinations before creating a batch. Each prompt runs with each model and each output limit.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-5">
			<div class="flex flex-col gap-1.5">
				<Label for="batch-name">Name</Label>
				<Input id="batch-name" bind:value={name} placeholder="Error handling sweep" />
			</div>

			<div class="flex flex-col gap-1.5">
				<Label for="batch-prompts">Prompts, one per line</Label>
				<Textarea id="batch-prompts" rows={4} bind:value={promptsText} placeholder="Improve error messages in the CLI." />
			</div>

			<fieldset class="flex flex-col gap-2">
				<legend class="mb-1 text-sm font-medium">Models</legend>
				{#each SAMPLE_MODELS as model (model.id)}
					{@const value = modelValue(model)}
					<div class="flex items-center gap-2">
						<Checkbox
							id={`batch-model-${model.id}`}
							disabled={!model.ready}
							checked={modelIds.includes(value)}
							onCheckedChange={(checked) => toggleModel(value, checked === true)}
						/>
						<Label for={`batch-model-${model.id}`} class="font-normal">
							{model.display_name}
							{#if !model.ready}
								<span class="text-muted-foreground">({model.reason})</span>
							{/if}
						</Label>
					</div>
				{/each}
			</fieldset>

			<div class="flex flex-col gap-1.5">
				<Label for="batch-limits">Output limits, in tokens</Label>
				<Input id="batch-limits" bind:value={limitsText} inputmode="numeric" placeholder="2048, 4096" class="font-mono" />
			</div>

			<div class="flex flex-col gap-2 border bg-muted/50 p-3" aria-live="polite">
				<p class="text-sm font-medium tabular-nums">
					{preview.total.toLocaleString("en-US")} {preview.total === 1 ? "combination" : "combinations"}
				</p>
				<p class="text-xs text-muted-foreground">
					{preview.promptCount} {preview.promptCount === 1 ? "prompt" : "prompts"} × {preview.modelCount}
					{preview.modelCount === 1 ? "model" : "models"} × {preview.settingCount}
					{preview.settingCount === 1 ? "limit" : "limits"}. Runs two at a time by default. A batch can have up to
					{MAX_MATRIX_MEMBERS} combinations.
				</p>
			</div>

			{#if preview.errors.length > 0}
				<Alert>
					<WarningIcon aria-hidden="true" />
					<AlertDescription>
						<ul class="flex list-disc flex-col gap-0.5 pl-4">
							{#each preview.errors as error (error)}
								<li>{error}</li>
							{/each}
						</ul>
					</AlertDescription>
				</Alert>
			{/if}
		</div>

		<Dialog.Footer class="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<p id="batch-create-reason" class="text-xs text-muted-foreground">Sample data. Creating a batch needs a connected node.</p>
			<div class="flex gap-2">
				<Button variant="outline" onclick={() => (open = false)}>Close</Button>
				<Button disabled aria-describedby="batch-create-reason">Create batch</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
