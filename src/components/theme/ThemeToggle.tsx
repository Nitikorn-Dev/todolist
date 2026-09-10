"use client";

import { useEffect, useState } from "react";
import {
  applyThemeClass,
  persistTheme,
  resolveInitialTheme,
  toggleTheme,
  type Theme,
} from "@/lib/theme/theme";

export function ThemeToggle() {
  // Server-rendered as "light" (no window there); corrected to the real
  // saved/OS theme right after mount. This is React's documented pattern
  // for reading browser-only state that can't be known during SSR — a
  // single, necessary correction, not the cascading-render pattern the
  // set-state-in-effect lint rule targets. A lazy useState initializer was
  // tried instead but left the button's label showing the server's stale
  // "light" text after hydration (React only patches suppressed-mismatch
  // text on the next real re-render, i.e. after a click) — silencing the
  // lint warning that way traded a real bug for a clean lint run, so the
  // effect is kept and the rule is disabled here instead.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveInitialTheme(window.localStorage, prefersDark));
  }, []);

  function handleClick() {
    setTheme((current) => {
      const next = toggleTheme(current);
      applyThemeClass(document.documentElement, next);
      persistTheme(window.localStorage, next);
      return next;
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle theme"
      suppressHydrationWarning
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
