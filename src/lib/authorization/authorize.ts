import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdminArea } from "./roles";
import type { UserRole } from "@/lib/supabase/database.types";

export type AuthorizedUser = {
  id: string;
  email: string;
  role: UserRole;
};

/** Server-side authenticated user + role, or null if not signed in / no profile. */
export async function getAuthorizedUser(): Promise<AuthorizedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return { id: user.id, email: user.email ?? "", role: profile.role };
}

/** Redirects away from admin-only server components/actions when the caller is not an ADMIN. */
export async function requireAdmin(): Promise<AuthorizedUser> {
  const user = await getAuthorizedUser();

  if (!user || !canAccessAdminArea(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
