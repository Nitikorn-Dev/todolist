import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Database } from "@/lib/supabase/database.types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Imported after the mock so Column's useRouter() call resolves.
const { Column } = await import("@/components/board/Column");
const { RecentTasksList } = await import("@/components/dashboard/RecentTasksList");

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type ColumnRow = Database["public"]["Tables"]["columns"]["Row"];

function makeColumn(overrides: Partial<ColumnRow> = {}): ColumnRow {
  return {
    id: "col-1",
    board_id: "board-1",
    name: "Todo",
    position: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTask(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: "task-1",
    board_id: "board-1",
    column_id: "col-1",
    title: "Do the thing",
    description: null,
    priority: "MEDIUM",
    due_date: null,
    position: 0,
    assigned_to: null,
    created_by: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("Column empty state", () => {
  it("shows a 'No tasks yet' message when the column has no tasks", () => {
    render(<Column column={makeColumn()} tasks={[]} columns={[]} profiles={[]} />);

    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
  });

  it("shows the task list instead of the empty message when tasks exist", () => {
    render(
      <Column
        column={makeColumn()}
        tasks={[makeTask()]}
        columns={[{ id: "col-1", name: "Todo" }]}
        profiles={[]}
      />
    );

    expect(screen.queryByText("No tasks yet.")).not.toBeInTheDocument();
    expect(screen.getByText("Do the thing")).toBeInTheDocument();
  });
});

describe("RecentTasksList empty state", () => {
  it("shows a message when there are no tasks", () => {
    render(<RecentTasksList tasks={[]} />);
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
  });

  it("lists tasks when present", () => {
    render(
      <RecentTasksList
        tasks={[
          {
            id: "t1",
            title: "Write report",
            priority: "MEDIUM",
            columnName: "Todo",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />
    );
    expect(screen.getByText("Write report")).toBeInTheDocument();
  });
});
