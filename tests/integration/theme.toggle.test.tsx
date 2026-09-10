import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme/theme";

function mockMatchMedia(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("ThemeToggle (meaningful UI behavior)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.restoreAllMocks();
  });

  it("shows Light and leaves the dark class off when the OS prefers light and nothing is saved", async () => {
    mockMatchMedia(false);
    render(<ThemeToggle />);

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("Light"));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("respects a previously persisted theme over the OS preference", async () => {
    mockMatchMedia(false); // OS prefers light...
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark"); // ...but the user had chosen dark.
    render(<ThemeToggle />);

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("Dark"));
  });

  it("switches to dark on click: updates the button, the <html> class, and storage", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("Light"));

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("Dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("switches back to light on a second click", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("Dark"));

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("Light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
