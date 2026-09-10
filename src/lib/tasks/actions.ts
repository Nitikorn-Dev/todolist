"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateTaskInput } from "@/lib/validation/task";
import { nextPosition } from "./position";
import { InvalidTaskPositionError, reorderTask, toPositions } from "./reorder";

export type TaskActionResult = {
  errors?: Record<string, string>;
};

function toTaskPayload(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    columnId: formData.get("columnId"),
    assignedTo: formData.get("assignedTo"),
  };
}

export async function createTaskAction(
  _prevState: TaskActionResult,
  formData: FormData
): Promise<TaskActionResult> {
  const validation = validateTaskInput(toTaskPayload(formData));
  if (!validation.success) {
    return { errors: validation.errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { errors: { form: "You must be signed in to create a task." } };
  }

  const { data: column } = await supabase
    .from("columns")
    .select("board_id")
    .eq("id", validation.data.columnId)
    .single();

  if (!column) {
    return { errors: { form: "Selected column no longer exists." } };
  }

  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("column_id", validation.data.columnId);

  const { error } = await supabase.from("tasks").insert({
    board_id: column.board_id,
    column_id: validation.data.columnId,
    title: validation.data.title,
    description: validation.data.description ?? null,
    priority: validation.data.priority,
    due_date: validation.data.dueDate ?? null,
    assigned_to: validation.data.assignedTo ?? null,
    created_by: user.id,
    position: nextPosition(count ?? 0),
  });

  if (error) {
    return { errors: { form: error.message } };
  }

  revalidatePath("/dashboard/tasks");
  return {};
}

export async function updateTaskAction(
  _prevState: TaskActionResult,
  formData: FormData
): Promise<TaskActionResult> {
  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || !taskId) {
    return { errors: { form: "Missing task id." } };
  }

  const validation = validateTaskInput(toTaskPayload(formData));
  if (!validation.success) {
    return { errors: validation.errors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { errors: { form: "You must be signed in to update a task." } };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title: validation.data.title,
      description: validation.data.description ?? null,
      priority: validation.data.priority,
      due_date: validation.data.dueDate ?? null,
      assigned_to: validation.data.assignedTo ?? null,
      column_id: validation.data.columnId,
    })
    .eq("id", taskId);

  if (error) {
    return { errors: { form: error.message } };
  }

  revalidatePath("/dashboard/tasks");
  return {};
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || !taskId) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/dashboard/tasks");
}

export type MoveTaskInput = {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  destinationIndex: number;
};

export type MoveTaskResult = { error?: string };

async function persistColumnOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  columnId: string,
  orderedTaskIds: string[]
) {
  await Promise.all(
    toPositions(orderedTaskIds).map(({ id, position }) =>
      supabase.from("tasks").update({ position, column_id: columnId }).eq("id", id)
    )
  );
}

/** Reorders within a column, or moves a task to another column, persisting position/column_id. */
export async function moveTaskAction(input: MoveTaskInput): Promise<MoveTaskResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to move a task." };
  }

  const { taskId, sourceColumnId, destinationColumnId, destinationIndex } = input;
  const sameColumn = sourceColumnId === destinationColumnId;

  const { data: sourceRows } = await supabase
    .from("tasks")
    .select("id")
    .eq("column_id", sourceColumnId)
    .order("position", { ascending: true });

  const { data: destinationRows } = sameColumn
    ? { data: sourceRows }
    : await supabase
        .from("tasks")
        .select("id")
        .eq("column_id", destinationColumnId)
        .order("position", { ascending: true });

  let outcome;
  try {
    outcome = reorderTask(
      sourceColumnId,
      (sourceRows ?? []).map((row) => row.id),
      destinationColumnId,
      (destinationRows ?? []).map((row) => row.id),
      taskId,
      destinationIndex
    );
  } catch (err) {
    if (err instanceof InvalidTaskPositionError) {
      return { error: err.message };
    }
    throw err;
  }

  await persistColumnOrder(supabase, destinationColumnId, outcome.destinationTaskIds);
  if (!sameColumn) {
    await persistColumnOrder(supabase, sourceColumnId, outcome.sourceTaskIds);
  }

  revalidatePath("/dashboard/tasks");
  return {};
}
