/** Unknown counters read "Unknown", never 0. See DESIGN.md section 7. */
export function formatCount(value: number | null | undefined): string {
	return value === null || value === undefined ? "Unknown" : value.toLocaleString("en-US");
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function shortHash(hash: string, length = 12): string {
	return hash.slice(0, length);
}
