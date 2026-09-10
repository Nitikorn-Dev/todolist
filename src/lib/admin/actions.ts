"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/authorization/authorize";
import { validateRoleChange } from "./validation";

export type UpdateRoleResult = {
  error?: string;
};

/** Changes another user's role. Admin-only (requireAdmin); RLS enforces it independently. */
export async function updateUserRoleAction(
  _prevState: UpdateRoleResult,
  formData: FormData
): Promise<UpdateRoleResult> {
  const admin = await requireAdmin();

  const targetUserId = formData.get("userId");
  if (typeof targetUserId !== "string" || !targetUserId) {
    return { error: "Missing user id." };
  }

  const validation = validateRoleChange({
    actingUserId: admin.id,
    targetUserId,
    role: formData.get("role"),
  });

  if (!validation.success) {
    return { error: validation.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: validation.role })
    .eq("id", targetUserId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/users");
  return {};
}
