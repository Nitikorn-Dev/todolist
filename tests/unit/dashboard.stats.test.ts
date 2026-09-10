import { describe, expect, it } from "vitest";
import {
  computeDashboardStats,
  getRecentTasks,
  toDashboardTasks,
  type DashboardTask,
} from "@/lib/dashboard/stats";

function task(overrides: Partial<DashboardTask> = {}): DashboardTask {
  return {
    id: "task-1",
    title: "Task",
    priority: "MEDIUM",
    columnName: "Todo",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("toDashboardTasks (transformation)", () => {
  it("joins each task to its column's name", () => {
    const result = toDashboardTasks(
      [
        {
          id: "t1",
          title: "Write report",
          priority: "MEDIUM",
          column_id: "col-1",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      [{ id: "col-1", name: "Todo" }]
    );

    expect(result).toEqual([
      {
        id: "t1",
        title: "Write report",
        priority: "MEDIUM",
        columnName: "Todo",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("maps a task whose column is missing to 'Unknown' instead of dropping it", () => {
    const result = toDashboardTasks(
      [
        {
          id: "t1",
          title: "Orphaned task",
          priority: "LOW",
          column_id: "missing-column",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      []
    );

    expect(result[0].columnName).toBe("Unknown");
  });

  it("returns an empty array for an empty task list", () => {
    expect(toDashboardTasks([], [{ id: "col-1", name: "Todo" }])).toEqual([]);
  });
});

describe("computeDashboardStats", () => {
  it("returns all zeros for an empty board", () => {
    expect(computeDashboardStats([])).toEqual({
      totalTasks: 0,
      todo: 0,
      inProgress: 0,
      completed: 0,
      highPriority: 0,
    });
  });

  it("counts tasks per column and by priority from real task data", () => {
    const tasks = [
      task({ id: "1", columnName: "Todo", priority: "LOW" }),
      task({ id: "2", columnName: "Todo", priority: "HIGH" }),
      task({ id: "3", columnName: "In Progress", priority: "HIGH" }),
      task({ id: "4", columnName: "Done", priority: "MEDIUM" }),
      task({ id: "5", columnName: "Done", priority: "HIGH" }),
    ];

    expect(computeDashboardStats(tasks)).toEqual({
      totalTasks: 5,
      todo: 2,
      inProgress: 1,
      completed: 2,
      highPriority: 3,
    });
  });

  it("matches column names case-insensitively", () => {
    const tasks = [task({ columnName: "todo" }), task({ columnName: "DONE" })];

    const stats = computeDashboardStats(tasks);
    expect(stats.todo).toBe(1);
    expect(stats.completed).toBe(1);
  });

  it("does not count a task under any bucket when its column name is unrecognized", () => {
    const tasks = [task({ columnName: "Unknown" })];

    const stats = computeDashboardStats(tasks);
    expect(stats.totalTasks).toBe(1);
    expect(stats.todo).toBe(0);
    expect(stats.inProgress).toBe(0);
    expect(stats.completed).toBe(0);
  });
});

describe("getRecentTasks", () => {
  it("orders tasks by most recently created first", () => {
    const tasks = [
      task({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" }),
      task({ id: "newest", createdAt: "2026-01-03T00:00:00.000Z" }),
      task({ id: "middle", createdAt: "2026-01-02T00:00:00.000Z" }),
    ];

    expect(getRecentTasks(tasks).map((t) => t.id)).toEqual(["newest", "middle", "old"]);
  });

  it("caps the result at the given limit (boundary)", () => {
    const tasks = Array.from({ length: 10 }, (_, i) =>
      task({ id: `t${i}`, createdAt: new Date(2026, 0, i + 1).toISOString() })
    );

    expect(getRecentTasks(tasks, 3)).toHaveLength(3);
  });

  it("defaults to 5 when no limit is given", () => {
    const tasks = Array.from({ length: 8 }, (_, i) =>
      task({ id: `t${i}`, createdAt: new Date(2026, 0, i + 1).toISOString() })
    );

    expect(getRecentTasks(tasks)).toHaveLength(5);
  });

  it("returns an empty array for a non-positive limit (boundary)", () => {
    expect(getRecentTasks([task()], 0)).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const tasks = [
      task({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
      task({ id: "b", createdAt: "2026-01-02T00:00:00.000Z" }),
    ];
    const original = [...tasks];

    getRecentTasks(tasks);

    expect(tasks).toEqual(original);
  });
});
