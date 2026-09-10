"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateSignIn, validateSignUp } from "@/lib/validation/auth";

export type AuthActionResult = {
  errors?: Record<string, string>;
};

export async function signUpAction(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const validation = validateSignUp({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validation.success) {
    return { errors: validation.errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: { name: validation.data.name },
    },
  });

  if (error) {
    return { errors: { form: error.message } };
  }

  redirect("/dashboard");
}

export async function signInAction(
  _prevState: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const validation = validateSignIn({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return { errors: validation.errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return { errors: { form: "Invalid email or password" } };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
