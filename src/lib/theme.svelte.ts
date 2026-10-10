/**
 * Light or dark appearance. A client preference, stored locally.
 * `src/app.html` applies the stored choice before first paint.
 */
export const THEME_STORAGE_KEY = "hive.theme";

class ThemeState {
	dark = $state(typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

	toggle(): void {
		this.dark = !this.dark;
	}
}

export const theme = new ThemeState();
