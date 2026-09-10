-- Phase 3: Database Foundation
-- Tables: profiles, boards, columns, tasks
-- Relationships, indexes.

-- gen_random_uuid() is built into Postgres core (13+), no extension needed.

create type public.user_role as enum ('ADMIN', 'MEMBER');
create type public.task_priority as enum ('LOW', 'MEDIUM', 'HIGH');

-- profiles: one row per auth.users row, id shared with auth.users.id.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  column_id uuid not null references public.columns (id) on delete cascade,
  title text not null,
  description text,
  priority public.task_priority not null default 'MEDIUM',
  due_date date,
  position integer not null default 0,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes justified by DATABASE.md section 6 (lookups used by board/task queries and reorder logic).
create index columns_board_id_idx on public.columns (board_id);
create index tasks_board_id_idx on public.tasks (board_id);
create index tasks_column_id_idx on public.tasks (column_id);
create index tasks_assigned_to_idx on public.tasks (assigned_to);
create index tasks_position_idx on public.tasks (position);
