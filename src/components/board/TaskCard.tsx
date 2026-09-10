"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteTaskAction, moveTaskAction } from "@/lib/tasks/actions";
import { TaskForm } from "./TaskForm";
import type { Database } from "@/lib/supabase/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

type DragPayload = { taskId: string; sourceColumnId: string };

type TaskCardProps = {
  task: Task;
  columnId: string;
  /** Ids of every task currently rendered in this column, in order. */
  taskIds: string[];
  columns: { id: string; name: string }[];
  profiles: { id: string; name: string }[];
};

export function TaskCard({ task, columnId, taskIds, columns, profiles }: TaskCardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const assignee = profiles.find((profile) => profile.id === task.assigned_to);

  function handleDragStart(event: React.DragEvent<HTMLLIElement>) {
    const payload: DragPayload = { taskId: task.id, sourceColumnId: columnId };
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDropBefore(event: React.DragEvent<HTMLLIElement>) {
    event.preventDefault();
    event.stopPropagation();

    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;

    const { taskId: draggedId, sourceColumnId } = JSON.parse(raw) as DragPayload;
    if (draggedId === task.id) return;

    const targetIndex = taskIds.indexOf(task.id);
    const sameColumn = sourceColumnId === columnId;
    const fromIndex = sameColumn ? taskIds.indexOf(draggedId) : -1;
    const destinationIndex =
      sameColumn && fromIndex !== -1 && fromIndex < targetIndex ? targetIndex - 1 : targetIndex;

    startTransition(async () => {
      await moveTaskAction({
        taskId: draggedId,
        sourceColumnId,
        destinationColumnId: columnId,
        destinationIndex,
      });
      router.refresh();
    });
  }

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDropBefore}
      className="cursor-grab rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm active:cursor-grabbing dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{task.title}</p>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      {task.description ? (
        <p className="mt-1 text-gray-600 dark:text-gray-400">{task.description}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        {task.due_date ? <span>Due {task.due_date}</span> : null}
        <span>{assignee ? `Assigned to ${assignee.name}` : "Unassigned"}</span>
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:underline">
          Edit
        </summary>
        <div className="mt-2">
          <TaskForm
            mode="edit"
            taskId={task.id}
            columns={columns}
            profiles={profiles}
            defaultValues={{
              title: task.title,
              description: task.description ?? "",
              priority: task.priority,
              dueDate: task.due_date ?? "",
              columnId: task.column_id,
              assignedTo: task.assigned_to ?? "",
            }}
          />
        </div>
      </details>

      <form action={deleteTaskAction} className="mt-2">
        <input type="hidden" name="taskId" value={task.id} />
        <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
          Delete
        </button>
      </form>
    </li>
  );
}
