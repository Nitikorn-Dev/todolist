import { test, expect } from "@playwright/test";

// These exercise real middleware/route-protection and real client-side
// validation. They deliberately never sign in with valid credentials, so
// no network call to Supabase Auth is made (an unauthenticated getUser()
// short-circuits locally) and no account is created in any real project.
//
// Selector note: Next.js renders its own hidden route announcer
// (#__next-route-announcer__) with role="alert", and role/name matching on
// our own alert proved flaky against it, so field errors are asserted by
// their FormField-assigned id (e.g. "email-error") instead.

test.describe("protected routes", () => {
  for (const path of ["/dashboard", "/dashboard/tasks", "/dashboard/admin/users"]) {
    test(`redirects an unauthenticated visitor from ${path} to /login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }

  test("allows unauthenticated visitors to reach public pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Task Manager" })).toBeVisible();

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
  });
});

test.describe("sign in form feedback", () => {
  test("shows an accessible error for an invalid email without contacting the backend", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    const error = page.locator("#email-error");
    await expect(error).toHaveText("Enter a valid email address");
    await expect(error).toHaveAttribute("role", "alert");
    // Still on /login: the invalid submission never reached Supabase.
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("sign up form feedback", () => {
  test("shows an accessible error when passwords don't match", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("different123");
    await page.getByRole("button", { name: "Sign up" }).click();

    const error = page.locator("#confirmPassword-error");
    await expect(error).toHaveText("Passwords do not match");
    await expect(page).toHaveURL(/\/signup/);
  });

  test("shows an accessible error for a password under 8 characters", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByLabel("Password", { exact: true }).fill("short1");
    await page.getByLabel("Confirm password").fill("short1");
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.locator("#password-error")).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });
});
