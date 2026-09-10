import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Board } from "@/components/board/Board";

// Board/columns/task CRUD for Phase 5. Drag & drop reorder is Phase 6.
export default async function TasksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen">
      <h1 className="p-4 pb-0 text-2xl font-semibold">Task Board</h1>
      <Board />
    </main>
  );
}
