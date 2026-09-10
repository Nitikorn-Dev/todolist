import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getDashboardTasks } from "@/lib/dashboard/queries";
import { computeDashboardStats, getRecentTasks } from "@/lib/dashboard/stats";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentTasksList } from "@/components/dashboard/RecentTasksList";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tasks = (await getDashboardTasks()) ?? [];
  const stats = computeDashboardStats(tasks);
  const recentTasks = getRecentTasks(tasks);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="break-all text-gray-600 dark:text-gray-400">Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mb-8">
        <StatsGrid stats={stats} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Tasks</h2>
        <RecentTasksList tasks={recentTasks} />
      </section>
    </main>
  );
}
