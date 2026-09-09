# DATABASE.md

## 1. Database

Use PostgreSQL through Supabase.

Required tables only:

- profiles
- boards
- columns
- tasks

Do not add tables without a clear requirement.

---

## 2. profiles

Fields:

- id
- name
- email
- role
- created_at
- updated_at

role:
- ADMIN
- MEMBER

Default:
MEMBER

The auth user ID should map safely to profiles.id.

---

## 3. boards

Fields:

- id
- name
- created_by
- created_at
- updated_at

---

## 4. columns

Fields:

- id
- board_id
- name
- position
- created_at
- updated_at

Default columns:
- Todo
- In Progress
- Done

---

## 5. tasks

Fields:

- id
- board_id
- column_id
- title
- description
- priority
- due_date
- position
- assigned_to
- created_by
- created_at
- updated_at

priority:
- LOW
- MEDIUM
- HIGH

Default:
MEDIUM

---

## 6. Relationships

boards
1 -> many columns

columns
1 -> many tasks

boards
1 -> many tasks

profiles
1 -> many assigned tasks

profiles
1 -> many created tasks

Use foreign keys.

Useful indexes may include:
- tasks.board_id
- tasks.column_id
- tasks.assigned_to
- tasks.position
- columns.board_id

Only add indexes that are justified.

---

## 7. RLS

RLS must remain enabled.

Authorization must not be bypassed just to simplify development or tests.

Person 2 owns:
- migrations
- schema
- RLS
- DB policies
- generated database types

---

## 8. Testing Database Behavior

Do not use production data for tests.

For integration tests, choose a safe isolated strategy appropriate to the project:

- local Supabase/PostgreSQL
- dedicated test database
- transaction/fixture cleanup
- another documented isolated strategy

The exact choice should be made during implementation based on the actual environment.

Integration tests should cover important persistence/authorization behavior, not every SQL statement.

---

## 9. Schema Change Protocol

If Person 1, 3, or 4 needs a schema change:

1. STOP implementation at the dependency.
2. Describe required table/field/policy change.
3. Explain why it is needed.
4. Person 2 implements the migration.
5. Regenerate types if required.
6. Dependent person resumes after the change is available.

No independent migration edits by other people.
