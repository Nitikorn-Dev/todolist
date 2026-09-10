import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Board = Database["public"]["Tables"]["boards"]["Row"];
type BoardColumn = Database["public"]["Tables"]["columns"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type ProfileSummary = { id: string; name: string };

export type BoardData = {
  board: Board;
  columns: BoardColumn[];
  tasks: Task[];
  profiles: ProfileSummary[];
};

const DEFAULT_COLUMNS = ["Todo", "In Progress", "Done"];

/**
 * Fetches the (single, shared) board with its columns/tasks/assignable
 * profiles, creating the board and its default columns on first use.
 */
export async function getBoardData(): Promise<BoardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let board: Board | null = (
    await supabase
      .from("boards")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
  ).data;

  if (!board) {
    const created = await supabase
      .from("boards")
      .insert({ name: "Team Board", created_by: user.id })
      .select("*")
      .single();
    board = created.data;
  }

  if (!board) {
    return null;
  }

  let columns: BoardColumn[] =
    (
      await supabase
        .from("columns")
        .select("*")
        .eq("board_id", board.id)
        .order("position", { ascending: true })
    ).data ?? [];

  if (columns.length === 0) {
    const created = await supabase
      .from("columns")
      .insert(
        DEFAULT_COLUMNS.map((name, index) => ({
          board_id: (board as Board).id,
          name,
          position: index,
        }))
      )
      .select("*");
    columns = created.data ?? [];
  }

  const tasks =
    (
      await supabase
        .from("tasks")
        .select("*")
        .eq("board_id", board.id)
        .order("position", { ascending: true })
    ).data ?? [];

  const profiles =
    (await supabase.from("profiles").select("id, name").order("name")).data ?? [];

  return { board, columns, tasks, profiles };
}
