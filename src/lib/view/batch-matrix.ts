/**
 * Local preview of a batch matrix. Mirrors the daemon's rules so the form can
 * explain problems before anything is submitted. The daemon remains the authority.
 */

/** Matches `MAX_MATRIX_MEMBERS` in slopconductor's `slop-core` orchestration rules. */
export const MAX_MATRIX_MEMBERS = 256;
export const MAX_OUTPUT_LIMIT = 32768;

export interface MatrixDraft {
	name: string;
	prompts: string[];
	modelIds: string[];
	outputLimitsText: string;
}

export interface MatrixPreview {
	total: number;
	promptCount: number;
	modelCount: number;
	settingCount: number;
	outputLimits: number[];
	errors: string[];
}

export function parseOutputLimits(text: string): { values: number[]; error: string | null } {
	const parts = text
		.split(",")
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
	if (parts.length === 0) return { values: [], error: "Enter at least one output limit." };

	const values: number[] = [];
	for (const part of parts) {
		if (!/^\d+$/.test(part)) return { values: [], error: `"${part}" is not a whole number.` };
		const n = Number(part);
		if (n < 1 || n > MAX_OUTPUT_LIMIT) {
			return { values: [], error: `Output limits must be between 1 and ${MAX_OUTPUT_LIMIT.toLocaleString("en-US")}.` };
		}
		values.push(n);
	}
	return { values, error: null };
}

export function previewMatrix(draft: MatrixDraft): MatrixPreview {
	const prompts = draft.prompts.map((p) => p.trim()).filter((p) => p.length > 0);
	const limits = parseOutputLimits(draft.outputLimitsText);
	const promptCount = prompts.length;
	const modelCount = draft.modelIds.length;
	const settingCount = limits.values.length;
	const total = promptCount * modelCount * settingCount;

	const errors: string[] = [];
	if (draft.name.trim().length === 0) errors.push("Name the batch.");
	if (promptCount === 0) errors.push("Add at least one prompt.");
	if (modelCount === 0) errors.push("Choose at least one model.");
	if (limits.error) errors.push(limits.error);
	if (total > MAX_MATRIX_MEMBERS) {
		errors.push(
			`A batch can have at most ${MAX_MATRIX_MEMBERS} combinations. This one has ${total.toLocaleString("en-US")}.`,
		);
	}

	return {
		total,
		promptCount,
		modelCount,
		settingCount,
		outputLimits: limits.values,
		errors,
	};
}
