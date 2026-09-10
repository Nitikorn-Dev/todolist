import { requireAdmin } from "@/lib/authorization/authorize";

// Placeholder protected page for Phase 4 (Roles & Authorization).
// The admin user list/management UI is implemented in Phase 8 (Person 2).
export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Admin: Users</h1>
      <p className="text-gray-600 dark:text-gray-400">Signed in as ADMIN ({admin.email})</p>
    </main>
  );
}
