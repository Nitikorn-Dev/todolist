import { describe, expect, it } from "vitest";
import { canAccessAdminArea, isAdmin, isMember } from "@/lib/authorization/roles";

describe("isAdmin", () => {
  it("returns true for ADMIN", () => {
    expect(isAdmin("ADMIN")).toBe(true);
  });

  it("returns false for MEMBER", () => {
    expect(isAdmin("MEMBER")).toBe(false);
  });

  it("returns false when role is missing", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("isMember", () => {
  it("returns true for MEMBER", () => {
    expect(isMember("MEMBER")).toBe(true);
  });

  it("returns false for ADMIN", () => {
    expect(isMember("ADMIN")).toBe(false);
  });

  it("returns false when role is missing", () => {
    expect(isMember(null)).toBe(false);
    expect(isMember(undefined)).toBe(false);
  });
});

describe("canAccessAdminArea", () => {
  it("allows ADMIN into the admin area", () => {
    expect(canAccessAdminArea("ADMIN")).toBe(true);
  });

  it("denies MEMBER access to the admin area", () => {
    expect(canAccessAdminArea("MEMBER")).toBe(false);
  });

  it("denies access when there is no role (unauthenticated/no profile)", () => {
    expect(canAccessAdminArea(null)).toBe(false);
    expect(canAccessAdminArea(undefined)).toBe(false);
  });
});
