import { describe, expect, it } from "vitest";
import { isAuthPath, isProtectedPath } from "@/lib/supabase/middleware";

describe("isProtectedPath", () => {
  it("treats /dashboard as protected", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
  });

  it("treats nested dashboard routes as protected", () => {
    expect(isProtectedPath("/dashboard/tasks")).toBe(true);
  });

  it("does not treat the home page as protected", () => {
    expect(isProtectedPath("/")).toBe(false);
  });

  it("does not treat /login as protected", () => {
    expect(isProtectedPath("/login")).toBe(false);
  });
});

describe("isAuthPath", () => {
  it("treats /login as an auth path", () => {
    expect(isAuthPath("/login")).toBe(true);
  });

  it("treats /signup as an auth path", () => {
    expect(isAuthPath("/signup")).toBe(true);
  });

  it("does not treat /dashboard as an auth path", () => {
    expect(isAuthPath("/dashboard")).toBe(false);
  });
});
