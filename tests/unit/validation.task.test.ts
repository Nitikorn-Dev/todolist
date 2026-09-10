import { describe, expect, it } from "vitest";
import { validateTaskInput } from "@/lib/validation/task";

const validColumnId = "11111111-1111-4111-8111-111111111111";
const validAssigneeId = "22222222-2222-4222-8222-222222222222";

function basePayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Write tests",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    columnId: validColumnId,
    assignedTo: "",
    ...overrides,
  };
}

describe("validateTaskInput", () => {
  it("accepts a minimal valid task (title + priority + column only)", () => {
    const result = validateTaskInput(basePayload());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Write tests");
      expect(result.data.description).toBeUndefined();
      expect(result.data.dueDate).toBeUndefined();
      expect(result.data.assignedTo).toBeUndefined();
    }
  });

  it("accepts a fully populated task", () => {
    const result = validateTaskInput(
      basePayload({
        description: "Cover CRUD, assignment, priority, due date",
        dueDate: "2026-01-15",
        assignedTo: validAssigneeId,
        priority: "HIGH",
      })
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("HIGH");
      expect(result.data.assignedTo).toBe(validAssigneeId);
    }
  });

  it("rejects a missing title", () => {
    const result = validateTaskInput(basePayload({ title: "" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.title).toBeDefined();
    }
  });

  it("rejects a title longer than 200 characters (boundary)", () => {
    const result = validateTaskInput(basePayload({ title: "a".repeat(201) }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.title).toBeDefined();
    }
  });

  it("accepts a title exactly 200 characters (boundary)", () => {
    const result = validateTaskInput(basePayload({ title: "a".repeat(200) }));

    expect(result.success).toBe(true);
  });

  it("rejects an invalid priority value", () => {
    const result = validateTaskInput(basePayload({ priority: "URGENT" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.priority).toBeDefined();
    }
  });

  it("rejects a malformed due date", () => {
    const result = validateTaskInput(basePayload({ dueDate: "not-a-date" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.dueDate).toBeDefined();
    }
  });

  it("rejects a column id that is not a UUID", () => {
    const result = validateTaskInput(basePayload({ columnId: "not-a-uuid" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.columnId).toBeDefined();
    }
  });

  it("rejects an assignee id that is not a UUID", () => {
    const result = validateTaskInput(basePayload({ assignedTo: "not-a-uuid" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.assignedTo).toBeDefined();
    }
  });
});
