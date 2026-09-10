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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Imported after the mocks so the action uses the mocked Supabase client.
const { moveTaskAction } = await import("@/lib/tasks/actions");

type UpdateCall = { id: string; payload: Record<string, unknown> };

/** Fakes just enough of the postgrest builder for select-by-column and update-by-id on `tasks`. */
function makeTasksTable(columnData: Record<string, { id: string }[]>) {
  const updates: UpdateCall[] = [];

  function builder() {
    let mode: "select" | "update" | null = null;
    let updatePayload: Record<string, unknown> | null = null;
    let selectedColumnId: string | null = null;

    const chain = {
      select: () => {
        mode = "select";
        return chain;
      },
      update: (payload: Record<string, unknown>) => {
        mode = "update";
        updatePayload = payload;
        return chain;
      },
      eq: (column: string, value: string) => {
        if (mode === "select" && column === "column_id") {
          selectedColumnId = value;
        }
        if (mode === "update" && column === "id") {
          updates.push({ id: value, payload: updatePayload! });
        }
        return chain;
      },
      order: () => chain,
      then: (resolve: (value: unknown) => void) => {
        if (mode === "select") {
          resolve({ data: columnData[selectedColumnId ?? ""] ?? [] });
        } else {
          resolve({ error: null });
        }
      },
    };
    return chain;
  }

  return { from: vi.fn(() => builder()), updates };
}

function reset() {
  getUserMock.mockReset();
  fromMock.mockReset();
}

describe("moveTaskAction", () => {
  afterEach(reset);

  it("rejects moving a task when the caller is not signed in", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const result = await moveTaskAction({
      taskId: "t1",
      sourceColumnId: "col-a",
      destinationColumnId: "col-a",
      destinationIndex: 0,
    });

    expect(result.error).toBeDefined();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("persists a same-column reorder as new positions for the whole column", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const table = makeTasksTable({
      "col-a": [{ id: "t1" }, { id: "t2" }, { id: "t3" }],
    });
    fromMock.mockImplementation(table.from);

    const result = await moveTaskAction({
      taskId: "t3",
      sourceColumnId: "col-a",
      destinationColumnId: "col-a",
      destinationIndex: 0,
    });

    expect(result.error).toBeUndefined();
    const byId = Object.fromEntries(table.updates.map((u) => [u.id, u.payload]));
    expect(byId).toMatchObject({
      t3: { position: 0, column_id: "col-a" },
      t1: { position: 1, column_id: "col-a" },
      t2: { position: 2, column_id: "col-a" },
    });
  });

  it("persists a cross-column move: destination gets the task inserted, source is renumbered without it", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const table = makeTasksTable({
      "col-a": [{ id: "t1" }, { id: "t2" }],
      "col-b": [{ id: "t3" }, { id: "t4" }],
    });
    fromMock.mockImplementation(table.from);

    const result = await moveTaskAction({
      taskId: "t1",
      sourceColumnId: "col-a",
      destinationColumnId: "col-b",
      destinationIndex: 1,
    });

    expect(result.error).toBeUndefined();
    const byId = Object.fromEntries(table.updates.map((u) => [u.id, u.payload]));
    expect(byId).toMatchObject({
      t2: { position: 0, column_id: "col-a" },
      t3: { position: 0, column_id: "col-b" },
      t1: { position: 1, column_id: "col-b" },
      t4: { position: 2, column_id: "col-b" },
    });
  });

  it("returns an error and writes nothing for an out-of-range destination index", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const table = makeTasksTable({ "col-a": [{ id: "t1" }, { id: "t2" }] });
    fromMock.mockImplementation(table.from);

    const result = await moveTaskAction({
      taskId: "t1",
      sourceColumnId: "col-a",
      destinationColumnId: "col-a",
      destinationIndex: 5,
    });

    expect(result.error).toBeDefined();
    expect(table.updates).toHaveLength(0);
  });
});
