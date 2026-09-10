import { execSync } from "node:child_process";
import { expect, test, type Locator, type Page } from "@playwright/test";

// Runs the full authenticated critical journey against a REAL disposable
// Supabase test project (see .env.local) — not the team's live project.
// Requires: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY in .env.local point at that
// disposable project, its migrations are pushed, and its Auth "Confirm
// email" setting is off (see supabase/config.toml's
// auth.email.enable_confirmations, pushed via `supabase config push`).
//
// Written as a small number of long tests (via test.step) rather than many
// small ones: each test() gets a fresh, cookie-less browser context, so a
// multi-step signed-in journey has to stay inside one test to keep the
// session.

function uniqueEmail(label: string) {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

// execSync (not execFileSync + shell:true) so the SQL string survives
// Windows cmd.exe's argument re-splitting as a single quoted argument.
function runSql(sql: string) {
  execSync(`npx supabase db query --linked "${sql}"`, { cwd: process.cwd(), stdio: "pipe" });
}

/** Promotes a user to ADMIN via the Supabase Management API (supabase CLI, --linked). Test-fixture setup only. */
function promoteToAdmin(email: string) {
  runSql(`update public.profiles set role = 'ADMIN' where email = '${email}';`);
}

/**
 * The board is shared by every user (single-board design, see Phase 5), so
 * tasks from earlier runs/manual testing pile up otherwise. Clears them so
 * the journey test's own column counts are deterministic.
 */
function clearAllTasks() {
  runSql(`delete from public.tasks;`);
}

/** Native HTML5 drag-and-drop: Playwright's mouse-based dragTo() doesn't fire dragstart/drop. */
async function dragAndDrop(source: Locator, target: Locator) {
  const dataTransfer = await source.page().evaluateHandle(() => new DataTransfer());
  await source.dispatchEvent("dragstart", { dataTransfer });
  await target.dispatchEvent("dragover", { dataTransfer });
  await target.dispatchEvent("drop", { dataTransfer });
  await source.dispatchEvent("dragend", { dataTransfer });
}

async function signUp(
  page: Page,
  { name, email, password }: { name: string; email: string; password: string }
) {
  await page.goto("/signup");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function signIn(page: Page, { email, password }: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("full authenticated journey: sign up -> sign in -> dashboard -> board -> create/update task -> drag & drop -> reorder -> dashboard updates -> sign out", async ({
  page,
}) => {
  // Many sequential steps against a real backend; under parallel test load
  // the shared dev server can be slow enough that the default 30s budget
  // isn't enough even though nothing is actually failing.
  test.setTimeout(60000);
  const email = uniqueEmail("journey");
  const password = "password123";

  clearAllTasks();

  await test.step("sign up creates an account and lands on the dashboard", async () => {
    await signUp(page, { name: "E2E Journey", email, password });
    await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
  });

  await test.step("sign out returns to /login", async () => {
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  await test.step("sign in with the same credentials returns to the dashboard", async () => {
    await signIn(page, { email, password });
  });

  await test.step("board shows the default columns", async () => {
    await page.goto("/dashboard/tasks");
    await expect(page.getByRole("heading", { name: "Task Board" })).toBeVisible();
    await expect(page.getByTestId("column-Todo")).toContainText("Todo (0)");
    await expect(page.getByTestId("column-In Progress")).toContainText("In Progress (0)");
    await expect(page.getByTestId("column-Done")).toContainText("Done (0)");
  });

  await test.step("create task: appears in Todo with the chosen priority", async () => {
    const todoColumn = page.getByTestId("column-Todo");
    // Scoped to the "+ Add task" <details> itself, not just the column: a
    // task card's own (separate) "Edit" <details> in the same column also
    // has a "Title"-labelled field, which is ambiguous if scoped to the
    // whole column.
    const addTaskForm = todoColumn.locator("details").filter({ hasText: "+ Add task" });
    await addTaskForm.locator("summary").click();
    await addTaskForm.getByLabel("Title").fill("Write the report");
    await addTaskForm.getByLabel("Priority").selectOption("HIGH");
    await addTaskForm.getByRole("button", { name: "Add task" }).click();

    await expect(todoColumn).toContainText("Todo (1)");
    const newCard = page.locator("li", { hasText: "Write the report" });
    await expect(newCard).toBeVisible();
    // Priority badge only (the create-task form's own <select> also renders
    // "High"/"HIGH" text, so scope to the card and match the badge's exact case).
    await expect(newCard.getByText("HIGH", { exact: true })).toBeVisible();
  });

  await test.step("update task: title and priority change", async () => {
    const card = page.locator("li", { hasText: "Write the report" });
    await card.getByText("Edit").click();
    await card.getByLabel("Title").fill("Write the final report");
    await card.getByLabel("Priority").selectOption("LOW");
    await card.getByRole("button", { name: "Save changes" }).click();

    const updatedCard = page.locator("li", { hasText: "Write the final report" });
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.getByText("LOW", { exact: true })).toBeVisible();
  });

  await test.step("drag & drop: moves the task from Todo to In Progress", async () => {
    const card = page.locator("li", { hasText: "Write the final report" });
    const dropZone = page.getByTestId("column-In Progress-drop-zone");

    await dragAndDrop(card, dropZone);

    await expect(page.getByTestId("column-Todo")).toContainText("Todo (0)");
    const inProgressColumn = page.getByTestId("column-In Progress");
    await expect(inProgressColumn).toContainText("In Progress (1)");
    await expect(inProgressColumn.getByText("Write the final report")).toBeVisible();
  });

  await test.step("reorder: a second task can be dragged above the first in the same column", async () => {
    await page.goto("/dashboard/tasks");
    const inProgressColumn = page.getByTestId("column-In Progress");
    // Scoped to the "+ Add task" <details> itself — see the comment on the
    // same pattern in the "create task" step above.
    const addTaskForm = inProgressColumn.locator("details").filter({ hasText: "+ Add task" });
    await addTaskForm.locator("summary").click();
    await addTaskForm.getByLabel("Title").fill("Review the report");
    await addTaskForm.getByRole("button", { name: "Add task" }).click();
    await expect(inProgressColumn).toContainText("In Progress (2)");

    const secondCard = page.locator("li", { hasText: "Review the report" });
    const firstCard = page.locator("li", { hasText: "Write the final report" });
    await dragAndDrop(secondCard, firstCard);

    const cardTitlesInOrder = inProgressColumn.locator("li p.font-medium");
    await expect(cardTitlesInOrder.first()).toHaveText("Review the report");
  });

  await test.step("dashboard reflects the current task state", async () => {
    await page.goto("/dashboard");
    const statsSection = page.locator("section").first();
    await expect(statsSection).toContainText("Total Tasks");
    await expect(statsSection).toContainText("2"); // 2 tasks created so far
  });

  await test.step("sign out returns to /login and re-protects the dashboard", async () => {
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test("ADMIN/MEMBER authorization: MEMBER is redirected away from /dashboard/admin/users", async ({
  page,
}) => {
  await signUp(page, {
    name: "Member User",
    email: uniqueEmail("member"),
    password: "password123",
  });

  await page.goto("/dashboard/admin/users");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("ADMIN/MEMBER authorization: ADMIN can reach /dashboard/admin/users", async ({ page }) => {
  const email = uniqueEmail("admin");
  const password = "password123";

  // Sign up first (creates the profile), promote via the DB, then sign in
  // fresh so the server re-reads the now-current role.
  await signUp(page, { name: "Admin User", email, password });
  promoteToAdmin(email);

  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, { email, password });

  await page.goto("/dashboard/admin/users");
  await expect(page).toHaveURL(/\/dashboard\/admin\/users/);
  await expect(page.getByRole("heading", { name: "Admin: Users" })).toBeVisible();
});
