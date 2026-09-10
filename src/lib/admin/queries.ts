import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/authorization/authorize";
import type { Database } from "@/lib/supabase/database.types";

export type AdminUserRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "name" | "email" | "role"
>;

/** All users for the admin user list. Redirects non-admins (via requireAdmin). */
export async function getAllUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .order("name", { ascending: true });

  return data ?? [];
}
