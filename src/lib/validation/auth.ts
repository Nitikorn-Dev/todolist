import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

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

export function validateSignUp(input: unknown): ValidationResult<SignUpInput> {
  const result = signUpSchema.safeParse(input);
  if (!result.success) {
    return { success: false, errors: toFieldErrors(result.error) };
  }
  return { success: true, data: result.data };
}

export function validateSignIn(input: unknown): ValidationResult<SignInInput> {
  const result = signInSchema.safeParse(input);
  if (!result.success) {
    return { success: false, errors: toFieldErrors(result.error) };
  }
  return { success: true, data: result.data };
}
