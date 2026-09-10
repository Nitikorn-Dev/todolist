import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signOutActionMock = vi.fn();

vi.mock("@/lib/auth/actions", () => ({
  signOutAction: (...args: unknown[]) => signOutActionMock(...args),
}));

const deleteTaskActionMock = vi.fn();

vi.mock("@/lib/tasks/actions", () => ({
  deleteTaskAction: (...args: unknown[]) => deleteTaskActionMock(...args),
  moveTaskAction: vi.fn(),
  createTaskAction: vi.fn(),
  updateTaskAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const { SignOutButton } = await import("@/components/auth/SignOutButton");
const { TaskCard } = await import("@/components/board/TaskCard");

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("pending state feedback (form submission in flight)", () => {
  afterEach(() => {
    signOutActionMock.mockReset();
    deleteTaskActionMock.mockReset();
  });

  it("shows 'Signing out...' and disables the button while sign-out is pending", async () => {
    const { promise, resolve } = deferred<void>();
    signOutActionMock.mockReturnValue(promise);
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    const pendingButton = await waitFor(() => screen.getByRole("button", { name: "Signing out..." }));
    expect(pendingButton).toBeDisabled();

    resolve();
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());
  });

  it("shows 'Deleting...' and disables the delete button while the delete is pending", async () => {
    const { promise, resolve } = deferred<void>();
    deleteTaskActionMock.mockReturnValue(promise);
    const user = userEvent.setup();
    render(
      <TaskCard
        task={{
          id: "task-1",
          board_id: "board-1",
          column_id: "col-1",
          title: "Ship it",
          description: null,
          priority: "MEDIUM",
          due_date: null,
          position: 0,
          assigned_to: null,
          created_by: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        columnId="col-1"
        taskIds={["task-1"]}
        columns={[{ id: "col-1", name: "Todo" }]}
        profiles={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete Ship it" }));

    const pendingButton = await waitFor(() =>
      screen.getByRole("button", { name: "Deleting Ship it" })
    );
    expect(pendingButton).toBeDisabled();
    expect(pendingButton).toHaveTextContent("Deleting...");

    resolve();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Delete Ship it" })).not.toBeDisabled()
    );
  });
});
