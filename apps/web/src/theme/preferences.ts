export type Theme = "light" | "dark";

/** Read only the non-sensitive display preference, falling back to light on restricted storage. */
export function readThemePreference(): Theme {
  try {
    return window.localStorage.getItem("psl-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Persist the display preference only; no analyzer or laboratory values enter browser storage. */
export function saveThemePreference(theme: Theme): boolean {
  try {
    window.localStorage.setItem("psl-theme", theme);
    return true;
  } catch {
    return false;
  }
}
