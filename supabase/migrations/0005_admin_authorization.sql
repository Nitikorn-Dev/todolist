-- Phase 4: RLS authorization for ADMIN.
-- security definer so the role lookup does not itself recurse through the
-- profiles RLS policies it is used inside of.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- Additive admin policies: an ADMIN keeps full access on top of the
-- Phase 3 owner-scoped policies (existing policies are not weakened).
create policy profiles_admin_full_access on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy boards_admin_full_access on public.boards
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy tasks_admin_full_access on public.tasks
  for all
  using (public.is_admin())
  with check (public.is_admin());
