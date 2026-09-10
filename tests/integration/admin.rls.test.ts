// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asFixtureSeeder, asUser, createAuthUser, createTestDb } from "./db/setup";

describe("admin user management RLS (Phase 8)", () => {
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

  it("lists every profile for an admin (the admin user list query)", async () => {
    const adminId = crypto.randomUUID();
    const memberId = crypto.randomUUID();
    await createAuthUser(db, { id: adminId, email: "admin@example.com", name: "Admin" });
    await createAuthUser(db, { id: memberId, email: "member@example.com", name: "Member" });
    await asFixtureSeeder(db);
    await db.query(`update public.profiles set role = 'ADMIN' where id = $1`, [adminId]);

    await asUser(db, adminId);
    const rows = await db.query<{ name: string; role: string }>(
      `select name, role from public.profiles order by name`
    );

    expect(rows.rows).toEqual(
      expect.arrayContaining([
        { name: "Admin", role: "ADMIN" },
        { name: "Member", role: "MEMBER" },
      ])
    );
  });

  it(
    "RLS alone permits an admin to change their own role (the self-change guard is enforced " +
      "at the application layer, in validateRoleChange, not by RLS)",
    async () => {
      const adminId = crypto.randomUUID();
      await createAuthUser(db, { id: adminId, email: "admin2@example.com", name: "Admin2" });
      await asFixtureSeeder(db);
      await db.query(`update public.profiles set role = 'ADMIN' where id = $1`, [adminId]);

      await asUser(db, adminId);
      const result = await db.query(`update public.profiles set role = 'MEMBER' where id = $1`, [
        adminId,
      ]);

      expect(result.affectedRows ?? 0).toBe(1);
    }
  );
});
