/**
 * Single source for how daemon statuses are presented: label, icon, and tone.
 * Components must not invent their own mapping. See DESIGN.md section 6.
 *
 * Status is shape, then word, then color. Text always stays in the foreground
 * token; tone colors only the icon and a faint tint behind the badge.
 */
import CheckCircleIcon from "phosphor-svelte/lib/CheckCircleIcon";
import CircleDashedIcon from "phosphor-svelte/lib/CircleDashedIcon";
import CircleIcon from "phosphor-svelte/lib/CircleIcon";
import CircleNotchIcon from "phosphor-svelte/lib/CircleNotchIcon";
import PauseIcon from "phosphor-svelte/lib/PauseIcon";
import ProhibitIcon from "phosphor-svelte/lib/ProhibitIcon";
import QuestionIcon from "phosphor-svelte/lib/QuestionIcon";
import WarningDiamondIcon from "phosphor-svelte/lib/WarningDiamondIcon";
import WarningIcon from "phosphor-svelte/lib/WarningIcon";
import XCircleIcon from "phosphor-svelte/lib/XCircleIcon";

export type StatusIcon = typeof CircleIcon;

export type StatusTone = "neutral" | "running" | "success" | "paused" | "unknown" | "failed";

export interface StatusMeta {
	label: string;
	icon: StatusIcon;
	tone: StatusTone;
	/** Spins while work is active. Disabled for reduced motion via `motion-safe:`. */
	spin: boolean;
}

const TONE_CLASS: Record<StatusTone, { icon: string; tint: string }> = {
	neutral: { icon: "text-muted-foreground", tint: "bg-muted" },
	running: { icon: "text-status-running", tint: "bg-status-running/15" },
	success: { icon: "text-status-success", tint: "bg-status-success/15" },
	paused: { icon: "text-status-paused", tint: "bg-status-paused/15" },
	unknown: { icon: "text-status-unknown", tint: "bg-status-unknown/15" },
	failed: { icon: "text-destructive", tint: "bg-destructive/10" },
};

export function toneClasses(tone: StatusTone): { icon: string; tint: string } {
	return TONE_CLASS[tone];
}

const UNKNOWN_STATUS: StatusMeta = {
	label: "Unknown status",
	icon: CircleIcon,
	tone: "neutral",
	spin: false,
};

const TURN: Record<string, StatusMeta> = {
	queued: { label: "Queued", icon: CircleDashedIcon, tone: "neutral", spin: false },
	paused: { label: "Paused", icon: PauseIcon, tone: "paused", spin: false },
	running: { label: "Running", icon: CircleNotchIcon, tone: "running", spin: true },
	completed: { label: "Completed", icon: CheckCircleIcon, tone: "success", spin: false },
	failed: { label: "Failed", icon: XCircleIcon, tone: "failed", spin: false },
	cancelled: { label: "Cancelled", icon: ProhibitIcon, tone: "neutral", spin: false },
	interrupted: { label: "Interrupted", icon: WarningDiamondIcon, tone: "unknown", spin: false },
	incomplete: { label: "Incomplete", icon: WarningIcon, tone: "unknown", spin: false },
};

const TOOL: Record<string, StatusMeta> = {
	pending: { label: "Pending", icon: CircleDashedIcon, tone: "neutral", spin: false },
	running: { label: "Running", icon: CircleNotchIcon, tone: "running", spin: true },
	completed: { label: "Completed", icon: CheckCircleIcon, tone: "success", spin: false },
	failed: { label: "Failed", icon: XCircleIcon, tone: "failed", spin: false },
	interrupted: { label: "Interrupted", icon: WarningDiamondIcon, tone: "unknown", spin: false },
	skipped: { label: "Skipped", icon: ProhibitIcon, tone: "neutral", spin: false },
};

const STEERING: Record<string, StatusMeta> = {
	accepted: { label: "Accepted", icon: CircleIcon, tone: "paused", spin: false },
	applied: { label: "Applied", icon: CheckCircleIcon, tone: "success", spin: false },
	rejected: { label: "Rejected", icon: XCircleIcon, tone: "failed", spin: false },
};

const WORKSPACE: Record<string, StatusMeta> = {
	reserved: { label: "Reserved", icon: CircleDashedIcon, tone: "neutral", spin: false },
	allocating: { label: "Creating worktree", icon: CircleNotchIcon, tone: "running", spin: true },
	ready: { label: "Ready", icon: CheckCircleIcon, tone: "success", spin: false },
	removing: { label: "Removing", icon: CircleNotchIcon, tone: "running", spin: true },
	removed: { label: "Removed", icon: CircleIcon, tone: "neutral", spin: false },
	failed: { label: "Failed", icon: XCircleIcon, tone: "failed", spin: false },
};

/**
 * Node connection state. "Not connected" is the honest default while the app
 * only shows sample data. It never looks like an active connection.
 */
const CONNECTION: Record<string, StatusMeta> = {
	"not-connected": { label: "Not connected", icon: CircleDashedIcon, tone: "neutral", spin: false },
	unreachable: { label: "Unreachable", icon: WarningDiamondIcon, tone: "unknown", spin: false },
	inactive: { label: "Inactive", icon: PauseIcon, tone: "paused", spin: false },
};

export function connectionStatusMeta(state: string): StatusMeta {
	return CONNECTION[state] ?? UNKNOWN_STATUS;
}

/** Shown beside a tool call whose external effects are uncertain. Never success. */
export const EFFECTS_UNKNOWN: StatusMeta = {
	label: "Effects unknown",
	icon: QuestionIcon,
	tone: "unknown",
	spin: false,
};

export function turnStatusMeta(status: string): StatusMeta {
	return TURN[status] ?? UNKNOWN_STATUS;
}

export function toolStatusMeta(status: string): StatusMeta {
	return TOOL[status] ?? UNKNOWN_STATUS;
}

export function steeringStatusMeta(status: string): StatusMeta {
	return STEERING[status] ?? UNKNOWN_STATUS;
}

export function workspaceStatusMeta(status: string): StatusMeta {
	return WORKSPACE[status] ?? UNKNOWN_STATUS;
}

/** Retry is offered only for these turn statuses. Matches the daemon's rule. */
export function isRetryableTurnStatus(status: string): boolean {
	return status === "failed" || status === "interrupted" || status === "cancelled" || status === "incomplete";
}
