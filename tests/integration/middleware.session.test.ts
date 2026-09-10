// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();
const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  }),
}));

// Imported after the mock so updateSession uses the mocked Supabase client.
const { updateSession } = await import("@/lib/supabase/middleware");

function makeRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

describe("updateSession (protected route behavior)", () => {
  afterEach(() => {
    getUserMock.mockReset();
    singleMock.mockReset();
  });

  it("redirects an unauthenticated request away from a protected route", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(makeRequest("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows an authenticated request to reach a protected route", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await updateSession(makeRequest("/dashboard"));

    expect(response.status).not.toBe(307);
  });

  it("redirects an authenticated user away from the login page", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await updateSession(makeRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("allows an unauthenticated request to reach the login page", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(makeRequest("/login"));

    expect(response.status).not.toBe(307);
  });
});

describe("updateSession (admin route protection)", () => {
  afterEach(() => {
    getUserMock.mockReset();
    singleMock.mockReset();
    fromMock.mockClear();
  });

  it("allows an ADMIN to reach an admin route", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    singleMock.mockResolvedValue({ data: { role: "ADMIN" } });

    const response = await updateSession(makeRequest("/dashboard/admin/users"));

    expect(response.status).not.toBe(307);
  });

  it("denies a MEMBER access to an admin route", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "member-1" } } });
    singleMock.mockResolvedValue({ data: { role: "MEMBER" } });

    const response = await updateSession(makeRequest("/dashboard/admin/users"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
    expect(response.headers.get("location")).not.toContain("/dashboard/admin");
  });

  it("does not query profiles for a non-admin dashboard route", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "member-1" } } });

    await updateSession(makeRequest("/dashboard"));

    expect(fromMock).not.toHaveBeenCalled();
  });
});
