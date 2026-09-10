import type { UserRole } from "@/lib/supabase/database.types";

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "ADMIN";
}

export function isMember(role: UserRole | null | undefined): boolean {
  return role === "MEMBER";
}

export function canAccessAdminArea(role: UserRole | null | undefined): boolean {
  return isAdmin(role);
}
