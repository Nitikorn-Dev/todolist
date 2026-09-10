import type { DashboardStats } from "@/lib/dashboard/stats";

type StatsGridProps = {
  stats: DashboardStats;
};

const CARDS: { key: keyof DashboardStats; label: string }[] = [
  { key: "totalTasks", label: "Total Tasks" },
  { key: "todo", label: "Todo" },
  { key: "inProgress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "highPriority", label: "High Priority" },
];

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{stats[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
