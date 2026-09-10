import { test, expect } from "@playwright/test";

test("home page loads and links to sign in / sign up", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Task Manager" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
});
