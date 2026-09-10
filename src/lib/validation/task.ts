import { z } from "zod";

export const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
export type TaskPriorityValue = (typeof taskPriorities)[number];

function emptyToUndefined(value: unknown) {
  return value === "" ? undefined : value;
}

export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000, "Description must be 2000 characters or fewer").optional()
  ),
  priority: z.enum(taskPriorities),
  dueDate: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid due date")
      .optional()
  ),
  columnId: z.string().uuid("Select a valid column"),
  assignedTo: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Select a valid assignee").optional()
  ),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export function validateTaskInput(input: unknown): ValidationResult<TaskInput> {
  const result = taskInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, errors: toFieldErrors(result.error) };
  }
  return { success: true, data: result.data };
}
