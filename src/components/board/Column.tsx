"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { moveTaskAction } from "@/lib/tasks/actions";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import type { Database } from "@/lib/supabase/database.types";

type ColumnRow = Database["public"]["Tables"]["columns"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

type DragPayload = { taskId: string; sourceColumnId: string };

type ColumnProps = {
  column: ColumnRow;
  tasks: TaskRow[];
  columns: { id: string; name: string }[];
  profiles: { id: string; name: string }[];
};

export function Column({ column, tasks, columns, profiles }: ColumnProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const taskIds = tasks.map((task) => task.id);

  function handleDropAtEnd(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;

    const { taskId: draggedId, sourceColumnId } = JSON.parse(raw) as DragPayload;
    const sameColumn = sourceColumnId === column.id;
    const destinationIndex = sameColumn ? taskIds.length - 1 : taskIds.length;

    startTransition(async () => {
      await moveTaskAction({
        taskId: draggedId,
        sourceColumnId,
        destinationColumnId: column.id,
        destinationIndex,
      });
      router.refresh();
    });
  }

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {column.name} <span className="text-gray-400">({tasks.length})</span>
      </h2>

      {tasks.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">No tasks yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              taskIds={taskIds}
              columns={columns}
              profiles={profiles}
            />
          ))}
        </ul>
      )}

      {/* Drop zone for appending to the end of the column (including empty columns). */}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDropAtEnd}
        className="min-h-8 rounded-md border border-dashed border-gray-300 dark:border-gray-600"
        aria-hidden
      />

      <details>
        <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">
          + Add task
        </summary>
        <div className="mt-2">
          <TaskForm
            mode="create"
            columns={columns}
            profiles={profiles}
            defaultValues={{
              title: "",
              description: "",
              priority: "MEDIUM",
              dueDate: "",
              columnId: column.id,
              assignedTo: "",
            }}
          />
        </div>
      </details>
    </div>
  );
}
