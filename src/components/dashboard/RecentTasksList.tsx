import type { DashboardTask } from "@/lib/dashboard/stats";

type RecentTasksListProps = {
  tasks: DashboardTask[];
};

export function RecentTasksList({ tasks }: RecentTasksListProps) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
          <span className="font-medium">{task.title}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{task.columnName}</span>
        </li>
      ))}
    </ul>
  );
}
