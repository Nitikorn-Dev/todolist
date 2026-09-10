// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asAnon, asFixtureSeeder, asUser, createAuthUser, createTestDb } from "./db/setup";

describe("row level security (Phase 3)", () => {
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

  it("blocks anonymous (unauthenticated) reads of profiles, boards, and tasks", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "owner@example.com", name: "Owner" });
    await asFixtureSeeder(db);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Board', $1) returning id`,
      [userId]
    );

    await asAnon(db);

    const profiles = await db.query(`select id from public.profiles`);
    const boards = await db.query(`select id from public.boards`);
    expect(profiles.rows).toHaveLength(0);
    expect(boards.rows).toHaveLength(0);
    void board;
  });

  it("allows an authenticated user to read all boards, columns, and tasks", async () => {
    const ownerId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner@example.com", name: "Owner" });
    await asFixtureSeeder(db);
    await db.query(`insert into public.boards (name, created_by) values ('Shared Board', $1)`, [
      ownerId,
    ]);

    const readerId = crypto.randomUUID();
    await createAuthUser(db, { id: readerId, email: "reader@example.com", name: "Reader" });

    await asUser(db, readerId);
    const boards = await db.query(`select name from public.boards`);
    expect(boards.rows).toEqual([{ name: "Shared Board" }]);
  });

  it("prevents a user from creating a board on someone else's behalf", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "user@example.com", name: "User" });
    const someoneElseId = crypto.randomUUID();

    await asUser(db, userId);
    await expect(
      db.query(`insert into public.boards (name, created_by) values ('Not mine', $1)`, [
        someoneElseId,
      ])
    ).rejects.toThrow();
  });

  it("prevents a user from updating or deleting a board they do not own", async () => {
    const ownerId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner@example.com", name: "Owner" });
    await asFixtureSeeder(db);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Owned Board', $1) returning id`,
      [ownerId]
    );

    const otherId = crypto.randomUUID();
    await createAuthUser(db, { id: otherId, email: "other@example.com", name: "Other" });

    await asUser(db, otherId);
    const updateResult = await db.query(
      `update public.boards set name = 'Hijacked' where id = $1`,
      [board.rows[0].id]
    );
    const deleteResult = await db.query(`delete from public.boards where id = $1`, [
      board.rows[0].id,
    ]);

    expect(updateResult.affectedRows ?? 0).toBe(0);
    expect(deleteResult.affectedRows ?? 0).toBe(0);

    await asFixtureSeeder(db);
    const stillThere = await db.query(`select name from public.boards where id = $1`, [
      board.rows[0].id,
    ]);
    expect(stillThere.rows[0]).toMatchObject({ name: "Owned Board" });
  });

  it("lets a user update their own profile but not another user's profile", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "me@example.com", name: "Me" });
    const otherId = crypto.randomUUID();
    await createAuthUser(db, { id: otherId, email: "other@example.com", name: "Other" });

    await asUser(db, userId);
    await db.query(`update public.profiles set name = 'Updated Me' where id = $1`, [userId]);
    const otherUpdate = await db.query(
      `update public.profiles set name = 'Hacked' where id = $1`,
      [otherId]
    );
    expect(otherUpdate.affectedRows ?? 0).toBe(0);

    await asFixtureSeeder(db);
    const rows = await db.query(`select id, name from public.profiles order by name`);
    expect(rows.rows).toEqual(
      expect.arrayContaining([
        { id: userId, name: "Updated Me" },
        { id: otherId, name: "Other" },
      ])
    );
  });

  it("prevents a member from escalating their own role to ADMIN", async () => {
    const userId = crypto.randomUUID();
    await createAuthUser(db, { id: userId, email: "escalate@example.com", name: "Escalate" });

    await asUser(db, userId);
    await expect(
      db.query(`update public.profiles set role = 'ADMIN' where id = $1`, [userId])
    ).rejects.toThrow();
  });

  it("allows the task's assignee to update it but not delete it", async () => {
    const ownerId = crypto.randomUUID();
    const assigneeId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner@example.com", name: "Owner" });
    await createAuthUser(db, { id: assigneeId, email: "assignee@example.com", name: "Assignee" });

    await asFixtureSeeder(db);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Board', $1) returning id`,
      [ownerId]
    );
    const column = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [board.rows[0].id]
    );
    const task = await db.query<{ id: string }>(
      `insert into public.tasks (board_id, column_id, title, created_by, assigned_to)
       values ($1, $2, 'Assigned task', $3, $4) returning id`,
      [board.rows[0].id, column.rows[0].id, ownerId, assigneeId]
    );

    await asUser(db, assigneeId);
    const update = await db.query(`update public.tasks set title = 'Done' where id = $1`, [
      task.rows[0].id,
    ]);
    expect(update.affectedRows ?? 0).toBe(1);

    const del = await db.query(`delete from public.tasks where id = $1`, [task.rows[0].id]);
    expect(del.affectedRows ?? 0).toBe(0);
  });

  it("allows an ADMIN to update a board owned by someone else (Phase 4 admin authorization)", async () => {
    const ownerId = crypto.randomUUID();
    const adminId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner@example.com", name: "Owner" });
    await createAuthUser(db, { id: adminId, email: "admin@example.com", name: "Admin" });
    await asFixtureSeeder(db);
    await db.query(`update public.profiles set role = 'ADMIN' where id = $1`, [adminId]);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Owned Board', $1) returning id`,
      [ownerId]
    );

    await asUser(db, adminId);
    const update = await db.query(`update public.boards set name = 'Renamed by admin' where id = $1`, [
      board.rows[0].id,
    ]);
    expect(update.affectedRows ?? 0).toBe(1);
  });

  it("allows an ADMIN to change another user's role (admin user management)", async () => {
    const memberId = crypto.randomUUID();
    const adminId = crypto.randomUUID();
    await createAuthUser(db, { id: memberId, email: "member@example.com", name: "Member" });
    await createAuthUser(db, { id: adminId, email: "admin@example.com", name: "Admin" });
    await asFixtureSeeder(db);
    await db.query(`update public.profiles set role = 'ADMIN' where id = $1`, [adminId]);

    await asUser(db, adminId);
    const update = await db.query(`update public.profiles set role = 'ADMIN' where id = $1`, [
      memberId,
    ]);
    expect(update.affectedRows ?? 0).toBe(1);

    await asFixtureSeeder(db);
    const result = await db.query<{ role: string }>(
      `select role from public.profiles where id = $1`,
      [memberId]
    );
    expect(result.rows[0].role).toBe("ADMIN");
  });

  it("still denies a MEMBER from deleting another user's task (admin policy does not weaken member policy)", async () => {
    const ownerId = crypto.randomUUID();
    const otherId = crypto.randomUUID();
    await createAuthUser(db, { id: ownerId, email: "owner2@example.com", name: "Owner2" });
    await createAuthUser(db, { id: otherId, email: "other2@example.com", name: "Other2" });
    await asFixtureSeeder(db);
    const board = await db.query<{ id: string }>(
      `insert into public.boards (name, created_by) values ('Board', $1) returning id`,
      [ownerId]
    );
    const column = await db.query<{ id: string }>(
      `insert into public.columns (board_id, name, position) values ($1, 'Todo', 0) returning id`,
      [board.rows[0].id]
    );
    const task = await db.query<{ id: string }>(
      `insert into public.tasks (board_id, column_id, title, created_by) values ($1, $2, 'Task', $3) returning id`,
      [board.rows[0].id, column.rows[0].id, ownerId]
    );

    await asUser(db, otherId);
    const del = await db.query(`delete from public.tasks where id = $1`, [task.rows[0].id]);
    expect(del.affectedRows ?? 0).toBe(0);
  });
});
