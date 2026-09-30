-- ---------------------------------------------------------------------------
-- Class head assignment: brings an existing ES RUNABA database up to date.
--
-- Symptom this fixes: the staff / class-head screens return
--   "column school_classes.head_teacher_id does not exist" (Postgres 42703)
-- which previously also blanked the Staff & Class Heads tab and the
-- dashboard overview.
--
-- Safe to run more than once. Paste into the Supabase SQL Editor and run.
-- ---------------------------------------------------------------------------

-- 1. The missing column (matches supabase/schema.sql line 140).
alter table public.school_classes
  add column if not exists head_teacher_id uuid
  references public.profiles (id) on delete set null;

create index if not exists school_classes_head_teacher_idx
  on public.school_classes (head_teacher_id);

-- 2. Helper used by the RLS policies below.
create or replace function public.current_user_is_class_head(class_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.school_classes
    where name = class_name and head_teacher_id = (select auth.uid())
  )
$$;

revoke all on function public.current_user_is_class_head(text) from public;
grant execute on function public.current_user_is_class_head(text) to authenticated;

-- 3. The RPC the Director of Studies calls to set a class head.
create or replace function public.assign_school_class_head(class_name text, teacher_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'dos' and not public.is_school_admin() then
    raise exception 'Only the Director of Studies can assign class heads.' using errcode = '42501';
  end if;
  if teacher_profile_id is not null and not exists (
    select 1 from public.profiles where id = teacher_profile_id and role = 'teacher'
  ) then
    raise exception 'Select an active teacher as the class head.' using errcode = '22023';
  end if;

  update public.school_classes set head_teacher_id = teacher_profile_id where name = class_name;
  if not found then
    raise exception 'The selected class was not found.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.assign_school_class_head(text, uuid) from public;
grant execute on function public.assign_school_class_head(text, uuid) to authenticated;

-- 4. Classes stay world-readable so the public site can list them.
grant select on public.school_classes to anon, authenticated;
grant insert, update, delete on public.school_classes to authenticated;
