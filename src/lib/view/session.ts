import type { SessionDetail } from "$lib/view/types";

/** The most recent turn decides what the session is doing. */
export function latestTurnStatus(detail: SessionDetail): string {
	const last = detail.turns[detail.turns.length - 1];
	return last?.status ?? "queued";
}

export type SessionGroupId = "running" | "paused" | "attention" | "queued" | "recent";

export interface SessionGroup {
	id: SessionGroupId;
	label: string;
	items: SessionDetail[];
}

const GROUPS: { id: SessionGroupId; label: string; statuses: string[] }[] = [
	{ id: "running", label: "Running", statuses: ["running"] },
	{ id: "paused", label: "Paused", statuses: ["paused"] },
	{ id: "attention", label: "Needs attention", statuses: ["interrupted", "incomplete", "failed"] },
	{ id: "queued", label: "Queued", statuses: ["queued"] },
	{ id: "recent", label: "Recent", statuses: ["completed", "cancelled"] },
];

/** Groups sessions by their latest turn. Empty groups are dropped. */
export function groupSessions(sessions: SessionDetail[]): SessionGroup[] {
	const groups: SessionGroup[] = [];
	for (const group of GROUPS) {
		const items = sessions.filter((s) => group.statuses.includes(latestTurnStatus(s)));
		if (items.length > 0) groups.push({ id: group.id, label: group.label, items });
	}
	return groups;
}
