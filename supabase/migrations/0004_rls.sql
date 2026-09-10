-- RLS foundation for Phase 3. Every table stays RLS-enabled with no
-- bypass policy. Fine-grained ADMIN/MEMBER authorization rules are
-- Phase 4 scope (IMPLEMENTATION_PLAN.md) and are layered on top later
-- without disabling anything defined here.

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;

-- FORCE so policies also apply to the table owner, not only to
-- anon/authenticated. Defense in depth, and required for these policies
-- to be exercised by tests connecting as the bootstrap/owner role.
alter table public.profiles force row level security;
alter table public.boards force row level security;
alter table public.columns force row level security;
alter table public.tasks force row level security;

-- profiles ---------------------------------------------------------------

create policy profiles_select_authenticated on public.profiles
  for select
  using (auth.role() = 'authenticated');

create policy profiles_update_own on public.profiles
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- profiles are inserted only by the handle_new_user trigger (security
-- definer), so no insert/delete policy is granted to regular users.

-- boards -------------------------------------------------------------------

create policy boards_select_authenticated on public.boards
  for select
  using (auth.role() = 'authenticated');

create policy boards_insert_own on public.boards
  for insert
  with check (created_by = auth.uid());

create policy boards_update_own on public.boards
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy boards_delete_own on public.boards
  for delete
  using (created_by = auth.uid());

-- columns --------------------------------------------------------------

create policy columns_select_authenticated on public.columns
  for select
  using (auth.role() = 'authenticated');

create policy columns_insert_authenticated on public.columns
  for insert
  with check (auth.role() = 'authenticated');

create policy columns_update_authenticated on public.columns
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy columns_delete_authenticated on public.columns
  for delete
  using (auth.role() = 'authenticated');

-- tasks ----------------------------------------------------------------

create policy tasks_select_authenticated on public.tasks
  for select
  using (auth.role() = 'authenticated');

create policy tasks_insert_own on public.tasks
  for insert
  with check (created_by = auth.uid());

create policy tasks_update_own_or_assigned on public.tasks
  for update
  using (created_by = auth.uid() or assigned_to = auth.uid())
  with check (created_by = auth.uid() or assigned_to = auth.uid());

create policy tasks_delete_own on public.tasks
  for delete
  using (created_by = auth.uid());
