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
  // Unique per column for create forms (every column renders one) and per
  // task for edit forms — using just `mode` produced duplicate DOM ids
  // (e.g. every column's create form was "create-new-title"), which breaks
  // <label for> association.
  const idPrefix = mode === "create" ? `create-${defaultValues.columnId}` : `edit-${taskId}`;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      {mode === "edit" && taskId ? <input type="hidden" name="taskId" value={taskId} /> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-title`} className="text-sm font-medium">
          Title
        </label>
        <input
          id={`${idPrefix}-title`}
          name="title"
          defaultValue={defaultValues.title}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby={state.errors?.title ? `${idPrefix}-title-error` : undefined}
          className={inputClassName}
        />
        {state.errors?.title ? (
          <p id={`${idPrefix}-title-error`} role="alert" className="text-sm text-red-600">
            {state.errors.title}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-description`} className="text-sm font-medium">
          Description
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={defaultValues.description}
          rows={2}
          aria-invalid={Boolean(state.errors?.description)}
          aria-describedby={state.errors?.description ? `${idPrefix}-description-error` : undefined}
          className={inputClassName}
        />
        {state.errors?.description ? (
          <p id={`${idPrefix}-description-error`} role="alert" className="text-sm text-red-600">
            {state.errors.description}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${idPrefix}-priority`} className="text-sm font-medium">
            Priority
          </label>
          <select
            id={`${idPrefix}-priority`}
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
          <label htmlFor={`${idPrefix}-dueDate`} className="text-sm font-medium">
            Due date
          </label>
          <input
            id={`${idPrefix}-dueDate`}
            name="dueDate"
            type="date"
            defaultValue={defaultValues.dueDate}
            aria-invalid={Boolean(state.errors?.dueDate)}
            aria-describedby={state.errors?.dueDate ? `${idPrefix}-dueDate-error` : undefined}
            className={inputClassName}
          />
          {state.errors?.dueDate ? (
            <p id={`${idPrefix}-dueDate-error`} role="alert" className="text-sm text-red-600">
              {state.errors.dueDate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${idPrefix}-columnId`} className="text-sm font-medium">
            Column
          </label>
          <select
            id={`${idPrefix}-columnId`}
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
          <label htmlFor={`${idPrefix}-assignedTo`} className="text-sm font-medium">
            Assignee
          </label>
          <select
            id={`${idPrefix}-assignedTo`}
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

      {state.errors?.form ? (
        <p role="alert" className="text-sm text-red-600">
          {state.errors.form}
        </p>
      ) : null}

      <SubmitButton>{mode === "create" ? "Add task" : "Save changes"}</SubmitButton>
    </form>
  );
}
