import { test } from "@playwright/test";

// The parts of the Phase 11 critical journey that need a real signed-in
// session against a real Postgres/Supabase Auth backend: Sign Up -> Sign In
// -> Dashboard -> Board -> Create Task -> Update Task -> Drag & Drop ->
// Reorder -> Dashboard updates -> ADMIN/MEMBER authorization -> Sign Out.
//
// This sandbox has neither Docker (no local `supabase start`) nor
// authorization to create accounts against the team's live Supabase
// project, so these cannot be executed here (see the Phase 11 completion
// report for the full explanation). They are left as documented, skipped
// placeholders rather than deleted, so the gap stays visible instead of
// silently missing, and so the team can un-skip and run them once a
// disposable local or test Supabase project (SUPABASE_URL/ANON_KEY, plus a
// TEST_USER_EMAIL/PASSWORD and a second ADMIN test account) is available in
// the environment running them.
//
// Each behavior below already has real (non-mocked) coverage today via
// pglite-backed integration tests, listed per step, which is why the app
// logic is trusted even though this specific end-to-end browser path is not
// exercised in this session:
//   - Create/Update Task persistence: tests/integration/tasks.persistence.test.ts
//   - Drag & Drop / Reorder persistence: tests/integration/tasks.reorder.persistence.test.ts
//   - Dashboard stats from real data: tests/integration/dashboard.persistence.test.ts
//   - ADMIN/MEMBER RLS authorization: tests/integration/database.rls.test.ts

test.skip(
  "full journey: sign up -> sign in -> dashboard -> board -> create/update task -> drag & drop -> reorder -> dashboard updates -> sign out",
  () => {
    // Requires a real Supabase Auth + Postgres backend; see comment above.
  }
);

test.skip("ADMIN can reach /dashboard/admin/users; MEMBER is redirected away", () => {
  // Requires two real signed-in sessions with different profiles.role values.
});
