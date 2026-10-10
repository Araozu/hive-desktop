import type { DeliveryMode, SteeringStatus } from "$lib/protocol/types";

/** Labels follow the daemon's delivery modes. Keep them plain and literal. */
export const DELIVERY_LABEL: Record<DeliveryMode, string> = {
	"after-turn": "After turn",
	"next-boundary": "Next boundary",
	immediate: "Immediate",
};

/** One-sentence explanation of what each mode does, in the daemon's terms. */
export const DELIVERY_HINT: Record<DeliveryMode, string> = {
	"after-turn": "Runs after the current turn finishes.",
	"next-boundary": "Applies after the current model call or tool finishes, before the next one starts.",
	immediate: "Interrupts the current model call or shell command, then waits for its real outcome.",
};

export function steeringHint(delivery: DeliveryMode, status: SteeringStatus | string): string {
	if (status === "applied") return "Applied at a safe boundary, before the next model request or tool.";
	if (status === "rejected") return "Rejected. The turn was not changed.";
	if (delivery === "after-turn") return "Accepted. It runs after this turn finishes.";
	if (delivery === "next-boundary") return "Accepted. It waits for the next safe boundary.";
	return "Accepted. It interrupts the current step.";
}
