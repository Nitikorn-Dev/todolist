// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: getUserMock },
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
