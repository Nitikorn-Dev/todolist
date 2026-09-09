import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/SignOutButton";

// Placeholder protected page for Phase 1 (Foundation + Auth).
// Real dashboard statistics/UI are implemented in Phase 7 (Person 4).
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400">Signed in as {user.email}</p>
      <SignOutButton />
    </main>
  );
}
