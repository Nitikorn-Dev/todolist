// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asFixtureSeeder, createAuthUser, createTestDb } from "./db/setup";

describe("database schema (Phase 3)", () => {
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

  it("creates a profile automatically when an auth user signs up, defaulting role to MEMBER", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "ada@example.com", name: "Ada" });

    const result = await db.query<{ id: string; name: string; email: string; role: string }>(
      `select id, name, email, role from public.profiles where id = $1`,
      [userId]
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      id: userId,
      name: "Ada",
      email: "ada@example.com",
      role: "MEMBER",
    });
  });

  it("deletes the profile when the underlying auth user is deleted", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "grace@example.com", name: "Grace" });
    await asFixtureSeeder(db);
    await db.query(`delete from auth.users where id = $1`, [userId]);

    const result = await db.query(`select id from public.profiles where id = $1`, [userId]);
    expect(result.rows).toHaveLength(0);
  });

  it("persists a board -> column -> task hierarchy with defaults applied", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "owner@example.com", name: "Owner" });
    await asFixtureSeeder(db);

    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Sprint Board', $1) returning id`,
      [userId]
    );
    const boardId = board.rows[0].id;

    const column = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [boardId]
    );
    const columnId = column.rows[0].id;

    const task = await db.query<{ id: string; priority: string; position: number }>(
      `insert into public.tasks (board_id, column_id, title, created_by)
       values ($1, $2, 'Write migration', $3)
       returning id, priority, position`,
      [boardId, columnId, userId]
    );

    expect(task.rows[0].priority).toBe("MEDIUM");
    expect(task.rows[0].position).toBe(0);

    const joined = await db.query(
      `select t.title, c.name as column_name, b.name as board_name
       from public.tasks t
       join public.columns c on c.id = t.column_id
       join public.boards b on b.id = t.board_id
       where t.id = $1`,
      [task.rows[0].id]
    );
    expect(joined.rows[0]).toMatchObject({
      title: "Write migration",
      column_name: "Todo",
      board_name: "Sprint Board",
    });
  });

  it("cascades deleting a board to its columns and tasks", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "cascade@example.com", name: "Cas" });
    await asFixtureSeeder(db);

    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Temp Board', $1) returning id`,
      [userId]
    );
    const boardId = board.rows[0].id;
    const column = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [boardId]
    );
    await db.query(
      `insert into public.tasks (board_id, column_id, title, created_by) values ($1, $2, 'Temp task', $3)`,
      [boardId, column.rows[0].id, userId]
    );

    await db.query(`delete from public.boards where id = $1`, [boardId]);

    const remainingColumns = await db.query(`select id from public.columns where board_id = $1`, [
      boardId,
    ]);
    const remainingTasks = await db.query(`select id from public.tasks where board_id = $1`, [
      boardId,
    ]);
    expect(remainingColumns.rows).toHaveLength(0);
    expect(remainingTasks.rows).toHaveLength(0);
  });

  it("rejects a task that references a non-existent column (foreign key enforced)", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "fk@example.com", name: "FK" });
    await asFixtureSeeder(db);

    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('FK Board', $1) returning id`,
      [userId]
    );

    await expect(
      db.query(
        `insert into public.tasks (board_id, column_id, title, created_by) values ($1, $2, 'Orphan task', $3)`,
        [board.rows[0].id, crypto.randomUUID(), userId]
      )
    ).rejects.toThrow();
  });

  it("rejects an invalid task priority (enum enforced)", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "enum@example.com", name: "Enum" });
    await asFixtureSeeder(db);

    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Enum Board', $1) returning id`,
      [userId]
    );
    const column = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [board.rows[0].id]
    );

    await expect(
      db.query(
        `insert into public.tasks (board_id, column_id, title, created_by, priority) values ($1, $2, 'Bad priority', $3, 'URGENT')`,
        [board.rows[0].id, column.rows[0].id, userId]
      )
    ).rejects.toThrow();
  });
});
