import { test, expect } from "@playwright/test";

test.describe("theme persistence", () => {
  test("toggling the theme persists across a reload", async ({ page }) => {
    await page.goto("/login");
    const toggle = page.getByRole("button", { name: "Toggle theme" });

    const initialLabel = await toggle.textContent();
    await toggle.click();
    const afterClickLabel = await toggle.textContent();
    expect(afterClickLabel).not.toBe(initialLabel);

    const isDarkAfterClick = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    await page.reload();

    await expect(toggle).toHaveText(afterClickLabel ?? "");
    const isDarkAfterReload = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkAfterReload).toBe(isDarkAfterClick);
  });

  test("persists across navigation to a different page", async ({ page }) => {
    await page.goto("/login");
    const toggle = page.getByRole("button", { name: "Toggle theme" });
    await toggle.click();
    const label = await toggle.textContent();

    await page.goto("/signup");
    await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveText(label ?? "");
  });
});
