import { describe, expect, it } from "vitest";
import { validateRoleChange } from "@/lib/admin/validation";

const adminId = "admin-1";
const memberId = "member-1";

describe("validateRoleChange", () => {
  it("allows an admin to change another user's role to ADMIN", () => {
    const result = validateRoleChange({
      actingUserId: adminId,
      targetUserId: memberId,
      role: "ADMIN",
    });

    expect(result).toEqual({ success: true, role: "ADMIN" });
  });

  it("allows an admin to change another user's role to MEMBER", () => {
    const result = validateRoleChange({
      actingUserId: adminId,
      targetUserId: memberId,
      role: "MEMBER",
    });

    expect(result).toEqual({ success: true, role: "MEMBER" });
  });

  it("rejects an invalid role value", () => {
    const result = validateRoleChange({
      actingUserId: adminId,
      targetUserId: memberId,
      role: "SUPERADMIN",
    });

    expect(result).toEqual({ success: false, error: "Invalid role." });
  });

  it("rejects a missing/empty role value", () => {
    const result = validateRoleChange({
      actingUserId: adminId,
      targetUserId: memberId,
      role: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an admin changing their own role (boundary: acting === target)", () => {
    const result = validateRoleChange({
      actingUserId: adminId,
      targetUserId: adminId,
      role: "MEMBER",
    });

    expect(result).toEqual({ success: false, error: "You cannot change your own role." });
  });
});
