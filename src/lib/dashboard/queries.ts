import { createClient } from "@/lib/supabase/server";
import { toDashboardTasks, type DashboardTask } from "./stats";

/** All tasks on the board, flattened for dashboard use, or null if not signed in. */
export async function getDashboardTasks(): Promise<DashboardTask[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, priority, column_id, created_at");
  const { data: columns } = await supabase.from("columns").select("id, name");

  return toDashboardTasks(tasks ?? [], columns ?? []);
}
