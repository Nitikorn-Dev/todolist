import type { UserRole } from "@/lib/supabase/database.types";

export type RoleChangeInput = {
  actingUserId: string;
  targetUserId: string;
  role: unknown;
};

export type RoleChangeResult =
  | { success: true; role: UserRole }
  | { success: false; error: string };

function isValidRole(value: unknown): value is UserRole {
  return value === "ADMIN" || value === "MEMBER";
}

/** Pure permission decision for an admin user-role change: valid role, and never on yourself. */
export function validateRoleChange(input: RoleChangeInput): RoleChangeResult {
  if (!isValidRole(input.role)) {
    return { success: false, error: "Invalid role." };
  }

  if (input.actingUserId === input.targetUserId) {
    return { success: false, error: "You cannot change your own role." };
  }

  return { success: true, role: input.role };
}
