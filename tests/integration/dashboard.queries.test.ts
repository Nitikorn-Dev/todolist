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

// Imported after the mocks so the query uses the mocked Supabase client.
const { getDashboardTasks } = await import("@/lib/dashboard/queries");

function chainable(result: unknown) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    then: (resolve: (value: unknown) => void) => resolve(result),
  };
  return chain;
}

function reset() {
  getUserMock.mockReset();
  fromMock.mockReset();
}

describe("getDashboardTasks", () => {
  afterEach(reset);

  it("returns null when there is no authenticated user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    expect(await getDashboardTasks()).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("joins real tasks and columns from the database into dashboard tasks", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    fromMock
      .mockImplementationOnce(() =>
        chainable({
          data: [
            {
              id: "t1",
              title: "Ship dashboard",
              priority: "HIGH",
              column_id: "col-1",
              created_at: "2026-01-05T00:00:00.000Z",
            },
          ],
        })
      )
      .mockImplementationOnce(() => chainable({ data: [{ id: "col-1", name: "In Progress" }] }));

    const result = await getDashboardTasks();

    expect(result).toEqual([
      {
        id: "t1",
        title: "Ship dashboard",
        priority: "HIGH",
        columnName: "In Progress",
        createdAt: "2026-01-05T00:00:00.000Z",
      },
    ]);
  });

  it("returns an empty array (not null) when signed in with no tasks yet", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    fromMock
      .mockImplementationOnce(() => chainable({ data: [] }))
      .mockImplementationOnce(() => chainable({ data: [] }));

    expect(await getDashboardTasks()).toEqual([]);
  });
});
