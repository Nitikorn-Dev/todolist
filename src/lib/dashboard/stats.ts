import type { Database } from "@/lib/supabase/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type ColumnRow = Database["public"]["Tables"]["columns"]["Row"];

/** A task flattened for dashboard purposes: its column's name instead of an id to join. */
export type DashboardTask = {
  id: string;
  title: string;
  priority: TaskRow["priority"];
  columnName: string;
  createdAt: string;
};

export type DashboardStats = {
  totalTasks: number;
  todo: number;
  inProgress: number;
  completed: number;
  highPriority: number;
};

/** Column names used by the default board (see supabase/migrations & src/lib/tasks/queries.ts). */
export const DASHBOARD_COLUMN_NAMES = {
  todo: "Todo",
  inProgress: "In Progress",
  completed: "Done",
} as const;

/** Joins raw task rows to their column's name. Unknown/missing columns map to "Unknown". */
export function toDashboardTasks(
  tasks: Pick<TaskRow, "id" | "title" | "priority" | "column_id" | "created_at">[],
  columns: Pick<ColumnRow, "id" | "name">[]
): DashboardTask[] {
  const columnNameById = new Map(columns.map((column) => [column.id, column.name]));

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    columnName: columnNameById.get(task.column_id) ?? "Unknown",
    createdAt: task.created_at,
  }));
}

function isInColumn(task: DashboardTask, columnName: string): boolean {
  return task.columnName.trim().toLowerCase() === columnName.toLowerCase();
}

/** Total/Todo/In Progress/Completed/High Priority counts, derived from real task data. */
export function computeDashboardStats(tasks: DashboardTask[]): DashboardStats {
  return {
    totalTasks: tasks.length,
    todo: tasks.filter((task) => isInColumn(task, DASHBOARD_COLUMN_NAMES.todo)).length,
    inProgress: tasks.filter((task) => isInColumn(task, DASHBOARD_COLUMN_NAMES.inProgress)).length,
    completed: tasks.filter((task) => isInColumn(task, DASHBOARD_COLUMN_NAMES.completed)).length,
    highPriority: tasks.filter((task) => task.priority === "HIGH").length,
  };
}

/** Most recently created tasks first, capped at `limit`. */
export function getRecentTasks(tasks: DashboardTask[], limit = 5): DashboardTask[] {
  if (limit <= 0) {
    return [];
  }

  return [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
