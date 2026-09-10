import { describe, expect, it } from "vitest";
import { InvalidTaskPositionError, reorderTask, toPositions } from "@/lib/tasks/reorder";

const COLUMN_A = "column-a";
const COLUMN_B = "column-b";

describe("reorderTask (within a column)", () => {
  it("moves a task to the beginning", () => {
    const result = reorderTask(COLUMN_A, ["a", "b", "c"], COLUMN_A, ["a", "b", "c"], "c", 0);

    expect(result.destinationTaskIds).toEqual(["c", "a", "b"]);
    expect(result.sourceTaskIds).toBe(result.destinationTaskIds);
  });

  it("moves a task to the middle", () => {
    const result = reorderTask(COLUMN_A, ["a", "b", "c", "d"], COLUMN_A, ["a", "b", "c", "d"], "a", 2);

    expect(result.destinationTaskIds).toEqual(["b", "c", "a", "d"]);
  });

  it("moves a task to the end", () => {
    const result = reorderTask(COLUMN_A, ["a", "b", "c"], COLUMN_A, ["a", "b", "c"], "a", 2);

    expect(result.destinationTaskIds).toEqual(["b", "c", "a"]);
  });

  it("preserves the order of unaffected tasks", () => {
    const result = reorderTask(
      COLUMN_A,
      ["a", "b", "c", "d", "e"],
      COLUMN_A,
      ["a", "b", "c", "d", "e"],
      "d",
      1
    );

    expect(result.destinationTaskIds).toEqual(["a", "d", "b", "c", "e"]);
  });

  it("is a no-op ordering when moved to its own position", () => {
    const result = reorderTask(COLUMN_A, ["a", "b", "c"], COLUMN_A, ["a", "b", "c"], "b", 1);

    expect(result.destinationTaskIds).toEqual(["a", "b", "c"]);
  });
});

describe("reorderTask (moving between columns)", () => {
  it("removes the task from the source column and inserts it into the destination column", () => {
    const result = reorderTask(COLUMN_A, ["a", "b"], COLUMN_B, ["c", "d"], "a", 0);

    expect(result.sourceTaskIds).toEqual(["b"]);
    expect(result.destinationTaskIds).toEqual(["a", "c", "d"]);
  });

  it("inserts at the end of the destination column", () => {
    const result = reorderTask(COLUMN_A, ["a", "b"], COLUMN_B, ["c", "d"], "a", 2);

    expect(result.destinationTaskIds).toEqual(["c", "d", "a"]);
  });

  it("inserts into the middle of the destination column", () => {
    const result = reorderTask(COLUMN_A, ["a"], COLUMN_B, ["c", "d", "e"], "a", 1);

    expect(result.destinationTaskIds).toEqual(["c", "a", "d", "e"]);
  });

  it("moves into an empty destination column", () => {
    const result = reorderTask(COLUMN_A, ["a", "b"], COLUMN_B, [], "a", 0);

    expect(result.sourceTaskIds).toEqual(["b"]);
    expect(result.destinationTaskIds).toEqual(["a"]);
  });
});

describe("reorderTask (invalid positions)", () => {
  it("rejects a negative destination index", () => {
    expect(() => reorderTask(COLUMN_A, ["a", "b"], COLUMN_A, ["a", "b"], "a", -1)).toThrow(
      InvalidTaskPositionError
    );
  });

  it("rejects a destination index past the end of the list", () => {
    expect(() => reorderTask(COLUMN_A, ["a", "b"], COLUMN_A, ["a", "b"], "a", 2)).toThrow(
      InvalidTaskPositionError
    );
  });

  it("rejects a non-integer destination index", () => {
    expect(() => reorderTask(COLUMN_A, ["a", "b"], COLUMN_A, ["a", "b"], "a", 0.5)).toThrow(
      InvalidTaskPositionError
    );
  });

  it("rejects moving a task that is not in the source column", () => {
    expect(() => reorderTask(COLUMN_A, ["a", "b"], COLUMN_A, ["a", "b"], "z", 0)).toThrow(
      InvalidTaskPositionError
    );
  });

  it("allows a destination index exactly at the end of a different column (append)", () => {
    const result = reorderTask(COLUMN_A, ["a"], COLUMN_B, ["c", "d"], "a", 2);
    expect(result.destinationTaskIds).toEqual(["c", "d", "a"]);
  });

  it("rejects a destination index one past the end of a different column", () => {
    expect(() => reorderTask(COLUMN_A, ["a"], COLUMN_B, ["c", "d"], "a", 3)).toThrow(
      InvalidTaskPositionError
    );
  });
});

describe("toPositions", () => {
  it("maps an ordered id list to 0-based positions", () => {
    expect(toPositions(["a", "b", "c"])).toEqual([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
    ]);
  });

  it("returns an empty array for an empty column", () => {
    expect(toPositions([])).toEqual([]);
  });
});
