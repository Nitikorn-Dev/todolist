// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();
const fromMock = vi.fn();

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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Imported after the mocks so the action uses the mocked Supabase client.
const { updateUserRoleAction } = await import("@/lib/admin/actions");

const adminId = "admin-1";
const memberId = "member-1";

/** A minimal thenable that also supports the postgrest-style chained calls the action uses. */
function chainable(result: unknown) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    update: () => chain,
    single: () => Promise.resolve(result),
    then: (resolve: (value: unknown) => void) => resolve(result),
  };
  return chain;
}

function reset() {
  getUserMock.mockReset();
  fromMock.mockReset();
  redirectMock.mockClear();
}

function buildFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("userId", memberId);
  formData.set("role", "ADMIN");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

function mockSignedInAs(userId: string, role: string) {
  getUserMock.mockResolvedValue({ data: { user: { id: userId, email: `${userId}@example.com` } } });
  fromMock.mockImplementationOnce(() => chainable({ data: { role } })); // requireAdmin's profile lookup
}

describe("updateUserRoleAction", () => {
  afterEach(reset);

  it("denies (redirects) a MEMBER attempting to change a role", async () => {
    mockSignedInAs(memberId, "MEMBER");

    await expect(updateUserRoleAction({}, buildFormData())).rejects.toThrow("REDIRECT:/dashboard");
    // Only the requireAdmin profile lookup happened; no update was attempted.
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it("denies (redirects) an unauthenticated caller", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    await expect(updateUserRoleAction({}, buildFormData())).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("rejects an admin changing their own role, without touching the database", async () => {
    mockSignedInAs(adminId, "ADMIN");

    const result = await updateUserRoleAction({}, buildFormData({ userId: adminId }));

    expect(result.error).toBe("You cannot change your own role.");
    // Only the requireAdmin profile lookup happened; no update was attempted.
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid role value", async () => {
    mockSignedInAs(adminId, "ADMIN");

    const result = await updateUserRoleAction({}, buildFormData({ role: "SUPERADMIN" }));

    expect(result.error).toBe("Invalid role.");
  });

  it("allows an admin to change another user's role", async () => {
    mockSignedInAs(adminId, "ADMIN");
    const eqMock = vi.fn(() => chainable({ error: null }));
    const updateMock = vi.fn(() => ({ eq: eqMock }));
    fromMock.mockImplementationOnce(() => ({ update: updateMock })); // the profiles update

    const result = await updateUserRoleAction({}, buildFormData({ userId: memberId, role: "ADMIN" }));

    expect(result.error).toBeUndefined();
    expect(updateMock).toHaveBeenCalledWith({ role: "ADMIN" });
    expect(eqMock).toHaveBeenCalledWith("id", memberId);
  });
});
