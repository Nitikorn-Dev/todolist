// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();
const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  }),
}));

const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

// Imported after the mocks so the module under test uses the mocked clients.
const { getAuthorizedUser, requireAdmin } = await import("@/lib/authorization/authorize");

function reset() {
  getUserMock.mockReset();
  singleMock.mockReset();
  redirectMock.mockClear();
}

describe("getAuthorizedUser", () => {
  afterEach(reset);

  it("returns null when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    expect(await getAuthorizedUser()).toBeNull();
  });

  it("returns id/email/role for an authenticated user with a profile", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ada@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { role: "MEMBER" } });

    expect(await getAuthorizedUser()).toEqual({
      id: "user-1",
      email: "ada@example.com",
      role: "MEMBER",
    });
  });

  it("returns null when authenticated but the profile row is missing", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ada@example.com" } },
    });
    singleMock.mockResolvedValue({ data: null });

    expect(await getAuthorizedUser()).toBeNull();
  });
});

describe("requireAdmin (server-side authorization)", () => {
  afterEach(reset);

  it("allows access and returns the user when they are an ADMIN", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "admin-1", email: "admin@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { role: "ADMIN" } });

    const result = await requireAdmin();

    expect(result).toEqual({ id: "admin-1", email: "admin@example.com", role: "ADMIN" });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("denies access and redirects a MEMBER away from the admin area", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "member-1", email: "member@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { role: "MEMBER" } });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("denies access and redirects an unauthenticated caller away from the admin area", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });
});
