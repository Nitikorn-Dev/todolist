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

// Imported after the mocks so the actions use the mocked Supabase client.
const { createTaskAction, updateTaskAction, deleteTaskAction } = await import(
  "@/lib/tasks/actions"
);

const validColumnId = "11111111-1111-4111-8111-111111111111";
const validTaskId = "33333333-3333-4333-8333-333333333333";

/** A minimal thenable that also supports the postgrest-style chained calls the actions use. */
function chainable(result: unknown) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    then: (resolve: (value: unknown) => void) => resolve(result),
  };
  return chain;
}

function reset() {
  getUserMock.mockReset();
  fromMock.mockReset();
}

function buildFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("title", "Write the report");
  formData.set("description", "");
  formData.set("priority", "MEDIUM");
  formData.set("dueDate", "");
  formData.set("columnId", validColumnId);
  formData.set("assignedTo", "");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

describe("createTaskAction", () => {
  afterEach(reset);

  it("returns validation errors and never touches the database when the title is missing", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const result = await createTaskAction({}, buildFormData({ title: "" }));

    expect(result.errors?.title).toBeDefined();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects creating a task when the caller is not signed in", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const result = await createTaskAction({}, buildFormData());

    expect(result.errors?.form).toBeDefined();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserts a task appended to the end of the column, tagged with the creator", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const insertMock = vi.fn(() => chainable({ error: null }));
    fromMock
      .mockImplementationOnce(() => chainable({ data: { board_id: "board-1" } })) // columns lookup
      .mockImplementationOnce(() => chainable({ count: 2 })) // existing task count
      .mockImplementationOnce(() => ({ insert: insertMock })); // tasks insert

    const result = await createTaskAction(
      {},
      buildFormData({ priority: "HIGH", dueDate: "2026-02-01" })
    );

    expect(result.errors).toBeUndefined();
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        board_id: "board-1",
        column_id: validColumnId,
        title: "Write the report",
        priority: "HIGH",
        due_date: "2026-02-01",
        created_by: "user-1",
        position: 2,
      })
    );
  });

  it("reports an error when the selected column no longer exists", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    fromMock.mockImplementationOnce(() => chainable({ data: null }));

    const result = await createTaskAction({}, buildFormData());

    expect(result.errors?.form).toBeDefined();
  });
});

describe("updateTaskAction", () => {
  afterEach(reset);

  it("returns an error when the task id is missing", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const formData = buildFormData();
    const result = await updateTaskAction({}, formData);

    expect(result.errors?.form).toBeDefined();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("updates the task's editable fields (priority, due date, assignee, column)", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const eqMock = vi.fn(() => chainable({ error: null }));
    const updateMock = vi.fn(() => ({ eq: eqMock }));
    fromMock.mockImplementationOnce(() => ({ update: updateMock }));

    const formData = buildFormData({ taskId: validTaskId, priority: "LOW" });
    const result = await updateTaskAction({}, formData);

    expect(result.errors).toBeUndefined();
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ priority: "LOW" }));
    expect(eqMock).toHaveBeenCalledWith("id", validTaskId);
  });
});

describe("deleteTaskAction", () => {
  afterEach(reset);

  it("does nothing when the task id is missing", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const formData = new FormData();
    await deleteTaskAction(formData);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it("does nothing when the caller is not signed in", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const formData = new FormData();
    formData.set("taskId", validTaskId);
    await deleteTaskAction(formData);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it("deletes the task by id when signed in", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const eqMock = vi.fn(() => chainable(undefined));
    const deleteMock = vi.fn(() => ({ eq: eqMock }));
    fromMock.mockImplementationOnce(() => ({ delete: deleteMock }));

    const formData = new FormData();
    formData.set("taskId", validTaskId);
    await deleteTaskAction(formData);

    expect(eqMock).toHaveBeenCalledWith("id", validTaskId);
  });
});
