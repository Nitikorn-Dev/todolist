import { describe, expect, it } from "vitest";
import { nextPosition } from "@/lib/tasks/position";

describe("nextPosition", () => {
  it("places the first task in an empty column at position 0", () => {
    expect(nextPosition(0)).toBe(0);
  });

  it("appends a new task after existing ones", () => {
    expect(nextPosition(3)).toBe(3);
  });

  it("handles a large existing count (boundary)", () => {
    expect(nextPosition(999)).toBe(999);
  });
});
