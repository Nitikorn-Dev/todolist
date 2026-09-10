import { describe, expect, it, vi } from "vitest";
import {
  applyThemeClass,
  getStoredTheme,
  isValidTheme,
  persistTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  toggleTheme,
} from "@/lib/theme/theme";

function fakeStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    _store: store,
  };
}

function fakeClassList() {
  const classes = new Set<string>();
  return {
    add: vi.fn((c: string) => classes.add(c)),
    remove: vi.fn((c: string) => classes.delete(c)),
    has: (c: string) => classes.has(c),
  };
}

describe("isValidTheme", () => {
  it("accepts 'light' and 'dark'", () => {
    expect(isValidTheme("light")).toBe(true);
    expect(isValidTheme("dark")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isValidTheme("blue")).toBe(false);
    expect(isValidTheme(null)).toBe(false);
    expect(isValidTheme(undefined)).toBe(false);
    expect(isValidTheme(123)).toBe(false);
  });
});

describe("getStoredTheme (theme persistence)", () => {
  it("returns the stored theme when it is a valid value", () => {
    const storage = fakeStorage({ [THEME_STORAGE_KEY]: "dark" });
    expect(getStoredTheme(storage)).toBe("dark");
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredTheme(fakeStorage())).toBeNull();
  });

  it("returns null when the stored value is corrupted/invalid", () => {
    const storage = fakeStorage({ [THEME_STORAGE_KEY]: "purple" });
    expect(getStoredTheme(storage)).toBeNull();
  });
});

describe("resolveInitialTheme (theme selection)", () => {
  it("prefers the persisted theme over the OS preference", () => {
    const storage = fakeStorage({ [THEME_STORAGE_KEY]: "light" });
    expect(resolveInitialTheme(storage, true)).toBe("light");
  });

  it("falls back to dark when the OS prefers dark and nothing is stored", () => {
    expect(resolveInitialTheme(fakeStorage(), true)).toBe("dark");
  });

  it("falls back to light when the OS prefers light and nothing is stored", () => {
    expect(resolveInitialTheme(fakeStorage(), false)).toBe("light");
  });
});

describe("toggleTheme", () => {
  it("switches dark to light", () => {
    expect(toggleTheme("dark")).toBe("light");
  });

  it("switches light to dark", () => {
    expect(toggleTheme("light")).toBe("dark");
  });
});

describe("persistTheme", () => {
  it("writes the theme under the shared storage key", () => {
    const storage = fakeStorage();
    persistTheme(storage, "dark");
    expect(storage._store[THEME_STORAGE_KEY]).toBe("dark");
  });
});

describe("applyThemeClass", () => {
  it("adds the dark class for dark theme", () => {
    const root = { classList: fakeClassList() };
    applyThemeClass(root, "dark");
    expect(root.classList.add).toHaveBeenCalledWith("dark");
    expect(root.classList.remove).not.toHaveBeenCalled();
  });

  it("removes the dark class for light theme", () => {
    const root = { classList: fakeClassList() };
    applyThemeClass(root, "light");
    expect(root.classList.remove).toHaveBeenCalledWith("dark");
    expect(root.classList.add).not.toHaveBeenCalled();
  });
});
