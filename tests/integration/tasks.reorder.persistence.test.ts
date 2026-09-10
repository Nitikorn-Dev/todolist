// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asFixtureSeeder, asUser, createAuthUser, createTestDb } from "./db/setup";
import { reorderTask, toPositions } from "@/lib/tasks/reorder";

describe("drag & drop persistence (Phase 6)", () => {
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

  async function seedBoard() {
    const ownerId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner@example.com", name: "Owner" });
    await asFixtureSeeder(db);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Board', $1) returning id`,
      [ownerId]
    );
    const columnA = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [board.rows[0].id]
    );
    const columnB = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Done', 1) returning id`,
      [board.rows[0].id]
    );
    return { ownerId, boardId: board.rows[0].id, columnAId: columnA.rows[0].id, columnBId: columnB.rows[0].id };
  }

  async function seedTasks(boardId: string, columnId: string, ownerId: string, titles: string[]) {
    const ids: string[] = [];
    for (let i = 0; i < titles.length; i++) {
      const { rows } = await db.query<{ id: string }>(
        `insert into public.tasks (board_id, column_id, title, created_by, position) values ($1, $2, $3, $4, $5) returning id`,
        [boardId, columnId, titles[i], ownerId, i]
      );
      ids.push(rows[0].id);
    }
    return ids;
  }

  it("persists a same-column reorder to the actual position values", async () => {
    const { ownerId, boardId, columnAId } = await seedBoard();
    const [t1, t2, t3] = await seedTasks(boardId, columnAId, ownerId, ["A", "B", "C"]);

    const outcome = reorderTask(columnAId, [t1, t2, t3], columnAId, [t1, t2, t3], t3, 0);

    await asUser(db, ownerId);
    for (const { id, position } of toPositions(outcome.destinationTaskIds)) {
      await db.query(`update public.tasks set position = $1, column_id = $2 where id = $3`, [
        position,
        columnAId,
        id,
      ]);
    }

    const rows = await db.query<{ id: string; position: number }>(
      `select id, position from public.tasks where column_id = $1 order by position`,
      [columnAId]
    );
    expect(rows.rows.map((r) => r.id)).toEqual([t3, t1, t2]);
  });

  it("dragging C to the top of Todo [A, B, C] persists C=0, A=1, B=2 in the database", async () => {
    // This is the exact scenario from the Phase 6 acceptance example:
    // Before: Todo [A, B, C]. Drag C to the top. After: Todo [C, A, B],
    // and the database rows themselves (not just the UI) must reflect it.
    const { ownerId, boardId, columnAId } = await seedBoard();
    const [taskA, taskB, taskC] = await seedTasks(boardId, columnAId, ownerId, ["A", "B", "C"]);

    // Sanity-check the starting state actually is A=0, B=1, C=2 before the drag.
    const before = await db.query<{ title: string; position: number }>(
      `select title, position from public.tasks where column_id = $1 order by position`,
      [columnAId]
    );
    expect(before.rows).toEqual([
      { title: "A", position: 0 },
      { title: "B", position: 1 },
      { title: "C", position: 2 },
    ]);

    // Same reorder logic the drop handler calls (src/lib/tasks/reorder.ts),
    // persisted the same way moveTaskAction persists it (src/lib/tasks/actions.ts).
    const outcome = reorderTask(
      columnAId,
      [taskA, taskB, taskC],
      columnAId,
      [taskA, taskB, taskC],
      taskC,
      0
    );

    await asUser(db, ownerId);
    for (const { id, position } of toPositions(outcome.destinationTaskIds)) {
      await db.query(`update public.tasks set position = $1, column_id = $2 where id = $3`, [
        position,
        columnAId,
        id,
      ]);
    }

    const after = await db.query<{ id: string; title: string; position: number }>(
      `select id, title, position from public.tasks where column_id = $1 order by position`,
      [columnAId]
    );

    // The DB rows themselves now carry the new order, not just something rendered in the UI.
    expect(after.rows).toEqual([
      { id: taskC, title: "C", position: 0 },
      { id: taskA, title: "A", position: 1 },
      { id: taskB, title: "B", position: 2 },
    ]);
  });

  it("persists a cross-column move: column_id changes for the moved task, positions renumber in both columns", async () => {
    const { ownerId, boardId, columnAId, columnBId } = await seedBoard();
    const [a1, a2] = await seedTasks(boardId, columnAId, ownerId, ["A1", "A2"]);
    const [b1, b2] = await seedTasks(boardId, columnBId, ownerId, ["B1", "B2"]);

    const outcome = reorderTask(columnAId, [a1, a2], columnBId, [b1, b2], a1, 1);

    await asUser(db, ownerId);
    for (const { id, position } of toPositions(outcome.destinationTaskIds)) {
      await db.query(`update public.tasks set position = $1, column_id = $2 where id = $3`, [
        position,
        columnBId,
        id,
      ]);
    }
    for (const { id, position } of toPositions(outcome.sourceTaskIds)) {
      await db.query(`update public.tasks set position = $1 where id = $2`, [position, id]);
    }

    const movedTask = await db.query<{ column_id: string; position: number }>(
      `select column_id, position from public.tasks where id = $1`,
      [a1]
    );
    expect(movedTask.rows[0]).toMatchObject({ column_id: columnBId, position: 1 });

    const remainingInSource = await db.query<{ id: string; position: number }>(
      `select id, position from public.tasks where column_id = $1 order by position`,
      [columnAId]
    );
    expect(remainingInSource.rows).toEqual([{ id: a2, position: 0 }]);

    const destinationOrder = await db.query<{ id: string }>(
      `select id from public.tasks where column_id = $1 order by position`,
      [columnBId]
    );
    expect(destinationOrder.rows.map((r) => r.id)).toEqual([b1, a1, b2]);
  });

  it("rejects an out-of-range position before touching the database", async () => {
    const { ownerId, boardId, columnAId } = await seedBoard();
    const [t1, t2] = await seedTasks(boardId, columnAId, ownerId, ["A", "B"]);

    expect(() => reorderTask(columnAId, [t1, t2], columnAId, [t1, t2], t1, 5)).toThrow();

    const rows = await db.query<{ position: number }>(
      `select position from public.tasks where id = $1`,
      [t1]
    );
    expect(rows.rows[0].position).toBe(0);
  });
});
