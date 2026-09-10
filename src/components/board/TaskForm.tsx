"use client";

import { useActionState } from "react";
import { createTaskAction, updateTaskAction, type TaskActionResult } from "@/lib/tasks/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initialState: TaskActionResult = {};
const inputClassName =
  "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900";

type TaskFormProps = {
  mode: "create" | "edit";
  taskId?: string;
  columns: { id: string; name: string }[];
  profiles: { id: string; name: string }[];
  defaultValues: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    columnId: string;
    assignedTo: string;
  };
};

export function TaskForm({ mode, taskId, columns, profiles, defaultValues }: TaskFormProps) {
  const action = mode === "create" ? createTaskAction : updateTaskAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {mode === "edit" && taskId ? <input type="hidden" name="taskId" value={taskId} /> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor={`${mode}-title-${taskId ?? "new"}`} className="text-sm font-medium">
          Title
        </label>
        <input
          id={`${mode}-title-${taskId ?? "new"}`}
          name="title"
          defaultValue={defaultValues.title}
          className={inputClassName}
        />
        {state.errors?.title ? <p className="text-sm text-red-600">{state.errors.title}</p> : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${mode}-description-${taskId ?? "new"}`} className="text-sm font-medium">
          Description
        </label>
        <textarea
          id={`${mode}-description-${taskId ?? "new"}`}
          name="description"
          defaultValue={defaultValues.description}
          rows={2}
          className={inputClassName}
        />
        {state.errors?.description ? (
          <p className="text-sm text-red-600">{state.errors.description}</p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${mode}-priority-${taskId ?? "new"}`} className="text-sm font-medium">
            Priority
          </label>
          <select
            id={`${mode}-priority-${taskId ?? "new"}`}
            name="priority"
            defaultValue={defaultValues.priority}
            className={inputClassName}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${mode}-dueDate-${taskId ?? "new"}`} className="text-sm font-medium">
            Due date
          </label>
          <input
            id={`${mode}-dueDate-${taskId ?? "new"}`}
            name="dueDate"
            type="date"
            defaultValue={defaultValues.dueDate}
            className={inputClassName}
          />
          {state.errors?.dueDate ? (
            <p className="text-sm text-red-600">{state.errors.dueDate}</p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${mode}-columnId-${taskId ?? "new"}`} className="text-sm font-medium">
            Column
          </label>
          <select
            id={`${mode}-columnId-${taskId ?? "new"}`}
            name="columnId"
            defaultValue={defaultValues.columnId}
            className={inputClassName}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${mode}-assignedTo-${taskId ?? "new"}`} className="text-sm font-medium">
            Assignee
          </label>
          <select
            id={`${mode}-assignedTo-${taskId ?? "new"}`}
            name="assignedTo"
            defaultValue={defaultValues.assignedTo}
            className={inputClassName}
          >
            <option value="">Unassigned</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.errors?.form ? <p className="text-sm text-red-600">{state.errors.form}</p> : null}

      <SubmitButton>{mode === "create" ? "Add task" : "Save changes"}</SubmitButton>
    </form>
  );
}
