/**
 * Pure theme selection/persistence logic, independent of the DOM and React,
 * so it can be unit tested directly (see tests/unit/theme.test.ts). Storage
 * and the document root are passed in rather than read from globals.
 */

export type Theme = "light" | "dark";

// Kept in sync by hand with the inline anti-flash script in src/app/layout.tsx,
// which cannot import this module (it must run before any JS bundle loads).
export const THEME_STORAGE_KEY = "theme";

export function isValidTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;
type ClassListLike = { add: (className: string) => void; remove: (className: string) => void };

export function getStoredTheme(storage: ReadableStorage): Theme | null {
  const value = storage.getItem(THEME_STORAGE_KEY);
  return isValidTheme(value) ? value : null;
}

/** The theme to use on first load: the user's saved choice, or the OS preference. */
export function resolveInitialTheme(storage: ReadableStorage, prefersDark: boolean): Theme {
  return getStoredTheme(storage) ?? (prefersDark ? "dark" : "light");
}

export function toggleTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

export function persistTheme(storage: WritableStorage, theme: Theme): void {
  storage.setItem(THEME_STORAGE_KEY, theme);
}

/** Applies (or removes) the "dark" class that src/app/globals.css's dark variant matches on. */
export function applyThemeClass(root: { classList: ClassListLike }, theme: Theme): void {
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
