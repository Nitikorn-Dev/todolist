import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const MIGRATIONS_DIR = path.resolve(__dirname, "../../../supabase/migrations");

/**
 * Boots a real (WASM) Postgres instance, adds a minimal stand-in for
 * Supabase's `auth` schema (auth.users + auth.uid()/auth.role()), then
 * runs the actual migration files from supabase/migrations so tests
 * exercise the real schema and RLS policies, not a re-description of them.
 */
export async function createTestDb() {
  const db = new PGlite();

  await db.exec(`
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid() returns uuid
      language sql stable
      as $$ select nullif(current_setting('app.current_user_id', true), '')::uuid $$;
    create function auth.role() returns text
      language sql stable
      as $$ select coalesce(nullif(current_setting('app.current_role', true), ''), 'anon') $$;
  `);

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await db.exec(sql);
  }

  // PGlite's bootstrap connection is a superuser, and superusers always
  // bypass RLS (FORCE ROW LEVEL SECURITY only removes the *owner*
  // exemption, not the superuser one). Mirror Supabase's actual role
  // model so tests exercise the real policies: non-superuser `anon`/
  // `authenticated` roles with ordinary table grants, restricted only by
  // the RLS policies themselves.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    grant usage on schema public to anon, authenticated;
    grant select, insert, update, delete on all tables in schema public to anon, authenticated;
  `);

  return db;
}

/** Simulates an authenticated request from the given user (RLS enforced). */
export async function asUser(db: PGlite, userId: string) {
  await db.exec(`reset role; set role authenticated;`);
  await db.query(`select set_config('app.current_user_id', $1, false)`, [userId]);
  await db.query(`select set_config('app.current_role', 'authenticated', false)`, []);
}

/** Simulates an unauthenticated request (RLS enforced, no user id). */
export async function asAnon(db: PGlite) {
  await db.exec(`reset role; set role anon;`);
  await db.query(`select set_config('app.current_user_id', '', false)`, []);
  await db.query(`select set_config('app.current_role', 'anon', false)`, []);
}

/** Bypasses RLS to seed fixtures directly, independent of the policies under test. */
export async function asFixtureSeeder(db: PGlite) {
  await db.exec(`reset role;`);
}

export async function createAuthUser(
  db: PGlite,
  user: { id: string; email: string; name: string }
) {
  await asFixtureSeeder(db);
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, jsonb_build_object('name', $3::text))`,
    [user.id, user.email, user.name]
  );
}
