// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asFixtureSeeder, asUser, createAuthUser, createTestDb } from "./db/setup";

describe("task board persistence (Phase 5)", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = await createTestDb();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await asFixtureSeeder(db);
    await db.exec(
      `truncate auth.users, public.profiles, public.boards, public.columns, public.tasks cascade;`
    );
  });

  async function seedBoardWithColumn() {
    const ownerId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner@example.com", name: "Owner" });
    await asFixtureSeeder(db);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Team Board', $1) returning id`,
      [ownerId]
    );
    const column = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [board.rows[0].id]
    );
    return { ownerId, boardId: board.rows[0].id, columnId: column.rows[0].id };
  }

  it("creates a task with assignment, priority, and due date", async () => {
    const { ownerId, boardId, columnId } = await seedBoardWithColumn();
    const assigneeId = crypto.randomUUID();
    await createAuthUser(db, { id: assigneeId, email: "assignee@example.com", name: "Assignee" });

    await asUser(db, ownerId);
    const task = await db.query<{
      title: string;
      priority: string;
      due_date: string;
      assigned_to: string;
      position: number;
    }>(
      `insert into public.tasks (board_id, column_id, title, priority, due_date, assigned_to, created_by, position)
       values ($1, $2, 'Ship Phase 5', 'HIGH', '2026-02-01', $3, $4, 0)
       returning title, priority, due_date, assigned_to, position`,
      [boardId, columnId, assigneeId, ownerId]
    );

    expect(task.rows[0]).toMatchObject({
      title: "Ship Phase 5",
      priority: "HIGH",
      assigned_to: assigneeId,
      position: 0,
    });
  });

  it("defaults priority to MEDIUM and leaves optional fields null when omitted", async () => {
    const { ownerId, boardId, columnId } = await seedBoardWithColumn();

    await asUser(db, ownerId);
    const task = await db.query<{ priority: string; due_date: string | null; assigned_to: string | null }>(
      `insert into public.tasks (board_id, column_id, title, created_by, position)
       values ($1, $2, 'Untriaged task', $3, 0)
       returning priority, due_date, assigned_to`,
      [boardId, columnId, ownerId]
    );

    expect(task.rows[0]).toMatchObject({ priority: "MEDIUM", due_date: null, assigned_to: null });
  });

  it("appends new tasks to the end of the column (position matches insertion order)", async () => {
    const { ownerId, boardId, columnId } = await seedBoardWithColumn();
    await asUser(db, ownerId);

    for (let i = 0; i < 3; i++) {
      const { rows } = await db.query<{ count: string }>(
        `select count(*)::int as count from public.tasks where column_id = $1`,
        [columnId]
      );
      const position = Number(rows[0].count);
      await db.query(
        `insert into public.tasks (board_id, column_id, title, created_by, position) values ($1, $2, $3, $4, $5)`,
        [boardId, columnId, `Task ${i}`, ownerId, position]
      );
    }

    const tasks = await db.query<{ title: string; position: number }>(
      `select title, position from public.tasks where column_id = $1 order by position`,
      [columnId]
    );
    expect(tasks.rows.map((t) => t.position)).toEqual([0, 1, 2]);
    expect(tasks.rows.map((t) => t.title)).toEqual(["Task 0", "Task 1", "Task 2"]);
  });

  it("updates priority, due date, assignee, and moves the task to another column", async () => {
    const { ownerId, boardId, columnId } = await seedBoardWithColumn();
    await asFixtureSeeder(db);
    const secondColumn = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'In Progress', 1) returning id`,
      [boardId]
    );
    const assigneeId = crypto.randomUUID();
    await createAuthUser(db, { id: assigneeId, email: "assignee2@example.com", name: "Assignee2" });
    const task = await db.query<{ id: string }>(
      `insert into public.tasks (board_id, column_id, title, created_by, position) values ($1, $2, 'Task', $3, 0) returning id`,
      [boardId, columnId, ownerId]
    );

    await asUser(db, ownerId);
    await db.query(
      `update public.tasks
       set priority = 'HIGH', due_date = '2026-03-01', assigned_to = $1, column_id = $2
       where id = $3`,
      [assigneeId, secondColumn.rows[0].id, task.rows[0].id]
    );

    const updated = await db.query(
      `select priority, due_date, assigned_to, column_id from public.tasks where id = $1`,
      [task.rows[0].id]
    );
    expect(updated.rows[0]).toMatchObject({
      priority: "HIGH",
      assigned_to: assigneeId,
      column_id: secondColumn.rows[0].id,
    });
  });

  it("deletes a task", async () => {
    const { ownerId, boardId, columnId } = await seedBoardWithColumn();
    await asUser(db, ownerId);
    const task = await db.query<{ id: string }>(
      `insert into public.tasks (board_id, column_id, title, created_by, position) values ($1, $2, 'Temp', $3, 0) returning id`,
      [boardId, columnId, ownerId]
    );

    await db.query(`delete from public.tasks where id = $1`, [task.rows[0].id]);

    const remaining = await db.query(`select id from public.tasks where id = $1`, [task.rows[0].id]);
    expect(remaining.rows).toHaveLength(0);
  });
});
