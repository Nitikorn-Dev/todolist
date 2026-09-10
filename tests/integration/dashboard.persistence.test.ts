// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asFixtureSeeder, asUser, createAuthUser, createTestDb } from "./db/setup";
import { computeDashboardStats, getRecentTasks, toDashboardTasks } from "@/lib/dashboard/stats";

describe("dashboard statistics from real data (Phase 7)", () => {
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

  it("computes dashboard stats and recent tasks from persisted board data", async () => {
    const ownerId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner@example.com", name: "Owner" });
    await asFixtureSeeder(db);

    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Board', $1) returning id`,
      [ownerId]
    );
    const todo = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [board.rows[0].id]
    );
    const inProgress = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'In Progress', 1) returning id`,
      [board.rows[0].id]
    );
    const done = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Done', 2) returning id`,
      [board.rows[0].id]
    );

    await asUser(db, ownerId);
    await db.query(
      `insert into public.tasks (board_id, column_id, title, priority, created_by, position, created_at) values
       ($1, $2, 'Todo task 1', 'LOW', $5, 0, now() - interval '3 days'),
       ($1, $2, 'Todo task 2 (urgent)', 'HIGH', $5, 1, now() - interval '2 days'),
       ($1, $3, 'In progress task', 'HIGH', $5, 0, now() - interval '1 day'),
       ($1, $4, 'Done task', 'MEDIUM', $5, 0, now())`,
      [board.rows[0].id, todo.rows[0].id, inProgress.rows[0].id, done.rows[0].id, ownerId]
    );

    const taskRows = (
      await db.query<{
        id: string;
        title: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        column_id: string;
        created_at: string;
      }>(`select id, title, priority, column_id, created_at from public.tasks`)
    ).rows;
    const columnRows = (
      await db.query<{ id: string; name: string }>(`select id, name from public.columns`)
    ).rows;

    const dashboardTasks = toDashboardTasks(taskRows, columnRows);
    const stats = computeDashboardStats(dashboardTasks);

    expect(stats).toEqual({
      totalTasks: 4,
      todo: 2,
      inProgress: 1,
      completed: 1,
      highPriority: 2,
    });

    const recent = getRecentTasks(dashboardTasks, 2);
    expect(recent.map((t) => t.title)).toEqual(["Done task", "In progress task"]);
  });

  it("reflects a task move (from Phase 6) in the dashboard's column counts", async () => {
    const ownerId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner2@example.com", name: "Owner2" });
    await asFixtureSeeder(db);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Board', $1) returning id`,
      [ownerId]
    );
    const todo = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [board.rows[0].id]
    );
    const done = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Done', 1) returning id`,
      [board.rows[0].id]
    );

    await asUser(db, ownerId);
    const task = await db.query<{ id: string }>(
      `insert into public.tasks (board_id, column_id, title, created_by, position) values ($1, $2, 'Task', $3, 0) returning id`,
      [board.rows[0].id, todo.rows[0].id, ownerId]
    );

    async function statsNow() {
      const taskRows = (
        await db.query<{
          id: string;
          title: string;
          priority: "LOW" | "MEDIUM" | "HIGH";
          column_id: string;
          created_at: string;
        }>(`select id, title, priority, column_id, created_at from public.tasks`)
      ).rows;
      const columnRows = (
        await db.query<{ id: string; name: string }>(`select id, name from public.columns`)
      ).rows;
      return computeDashboardStats(toDashboardTasks(taskRows, columnRows));
    }

    expect((await statsNow()).todo).toBe(1);
    expect((await statsNow()).completed).toBe(0);

    await db.query(`update public.tasks set column_id = $1, position = 0 where id = $2`, [
      done.rows[0].id,
      task.rows[0].id,
    ]);

    expect((await statsNow()).todo).toBe(0);
    expect((await statsNow()).completed).toBe(1);
  });
});
