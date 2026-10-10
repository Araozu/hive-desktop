/**
 * Local UI state only. Nothing here is daemon state.
 * Selection, panel visibility, and the sample scenario are client preferences.
 */
import type { DeliveryMode } from "$lib/protocol/types";
import type { SampleScenario } from "$lib/demo/sample-data";

export type Section = "sessions" | "batches" | "projects" | "nodes";
export type InspectorTab = "workspace" | "events" | "artifacts" | "turn";

export const SECTIONS: { id: Section; label: string }[] = [
	{ id: "sessions", label: "Sessions" },
	{ id: "batches", label: "Batches" },
	{ id: "projects", label: "Projects" },
	{ id: "nodes", label: "Nodes" },
];

class AppState {
	section = $state<Section>("sessions");
	scenario = $state<SampleScenario>("sample");

	sessionId = $state<string | null>(null);
	batchId = $state<string | null>(null);
	cellIndex = $state<number | null>(null);
	projectId = $state<string | null>(null);

	inspectorTab = $state<InspectorTab>("workspace");
	deliveryMode = $state<DeliveryMode>("after-turn");
	modelId = $state("glm-5.3-flash");

	/** Desktop panel visibility, used at or above the matching breakpoint. */
	listVisible = $state(true);
	inspectorVisible = $state(true);
	/** Sheet visibility, used below the matching breakpoint. */
	listSheetOpen = $state(false);
	inspectorSheetOpen = $state(false);

	/** Breakpoint flags, kept in sync by `observeViewport`. */
	lg = $state(true);
	xl = $state(true);

	toggleList(): void {
		if (this.lg) this.listVisible = !this.listVisible;
		else this.listSheetOpen = !this.listSheetOpen;
	}

	toggleInspector(): void {
		if (this.xl) this.inspectorVisible = !this.inspectorVisible;
		else this.inspectorSheetOpen = !this.inspectorSheetOpen;
	}

	selectSection(section: Section): void {
		this.section = section;
		this.listSheetOpen = false;
	}
}

export const appState = new AppState();

/** Keeps breakpoint flags in sync with the window. Returns a cleanup function. */
export function observeViewport(): () => void {
	const lgQuery = window.matchMedia("(min-width: 1024px)");
	const xlQuery = window.matchMedia("(min-width: 1280px)");
	const sync = () => {
		appState.lg = lgQuery.matches;
		appState.xl = xlQuery.matches;
		if (lgQuery.matches) appState.listSheetOpen = false;
		if (xlQuery.matches) appState.inspectorSheetOpen = false;
	};
	sync();
	lgQuery.addEventListener("change", sync);
	xlQuery.addEventListener("change", sync);
	return () => {
		lgQuery.removeEventListener("change", sync);
		xlQuery.removeEventListener("change", sync);
	};
}
