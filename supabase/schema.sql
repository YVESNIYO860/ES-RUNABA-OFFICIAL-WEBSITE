create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher', 'dos')),
  full_name text not null default '',
  email text unique,
  username text unique,
  reg_number text unique,
  class text,
  start_year integer,
  subject text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists start_year integer;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('student', 'teacher', 'dos'));

create table if not exists public.elearning_assignments (
  id text primary key,
  title text not null,
  class text not null,
  subject text not null default '',
  description text not null default '',
  due_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.elearning_quizzes (
  id text primary key,
  title text not null,
  class text not null,
  subject text not null default '',
  questions jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.elearning_quizzes
  add column if not exists deadline date,
  add column if not exists paper_settings jsonb not null default '{}'::jsonb;

create table if not exists public.elearning_notes (
  id text primary key,
  title text not null,
  class text not null,
  subject text not null default '',
  description text not null default '',
  file_name text not null,
  file_path text not null unique,
  target_classes text[] not null default '{}'::text[],
  target_student_ids uuid[] not null default '{}'::uuid[],
  access_key_hash text not null default '',
  date_posted text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_resource_access (
  student_id uuid not null references public.profiles (id) on delete cascade,
  resource_type text not null check (resource_type in ('quiz', 'note')),
  resource_id text not null,
  key_hash text not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, resource_type, resource_id)
);

alter table public.learning_resource_access enable row level security;
revoke all on public.learning_resource_access from public, anon, authenticated;

alter table public.elearning_notes
  add column if not exists target_classes text[] not null default '{}'::text[],
  add column if not exists target_student_ids uuid[] not null default '{}'::uuid[],
  add column if not exists access_key_hash text not null default '';

create table if not exists public.elearning_submissions (
  id text primary key,
  assignment_id text not null references public.elearning_assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_reg_number text not null,
  class text not null,
  submitted_at timestamptz not null default now(),
  file_name text,
  file_path text,
  file_type text
);

alter table public.elearning_submissions
  add column if not exists file_name text,
  add column if not exists file_path text,
  add column if not exists file_type text;

create table if not exists public.elearning_quiz_results (
  id text primary key,
  quiz_id text not null references public.elearning_quizzes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_reg_number text not null,
  class text not null,
  score integer not null default 0,
  total integer not null default 0,
  has_essay boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id text primary key,
  attendance_date date not null,
  session text not null default 'Daily',
  class text not null,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_reg_number text not null,
  student_name text not null,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  note text not null default '',
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (attendance_date, session, class, student_id)
);

create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.school_events (
  id text primary key,
  event_date text not null,
  title text not null,
  location text not null default '',
  description text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.school_updates (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('news', 'notice', 'announcement')),
  title text not null,
  content text not null,
  is_active boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.school_classes (
  name text primary key check (name = btrim(name) and name <> ''),
  head_teacher_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.school_classes add column if not exists head_teacher_id uuid references public.profiles (id) on delete set null;

create table if not exists public.school_courses (
  name text primary key check (name = btrim(name) and name <> ''),
  created_at timestamptz not null default now()
);

create unique index if not exists school_classes_name_ci_idx on public.school_classes (lower(name));
create unique index if not exists school_courses_name_ci_idx on public.school_courses (lower(name));

insert into public.school_classes (name)
select distinct btrim(class_name)
from (
  select class as class_name from public.profiles
  union all select class from public.elearning_assignments
  union all select class from public.elearning_quizzes
  union all select class from public.elearning_notes
  union all select unnest(target_classes) from public.elearning_notes
  union all select class from public.attendance_records
  union all select class from public.elearning_submissions
  union all select class from public.elearning_quiz_results
  union all select unnest(array[
    'None',
    'Senior 1', 'Senior 2', 'Senior 3',
    'Senior 4 Stream 1', 'Senior 4 Stream 2', 'Senior 4 MEG', 'Senior 4 MCE', 'Senior 4 PCB',
    'Senior 4 Science Stream One', 'Senior 4 Science Stream Two',
    'Senior 5 Stream 1', 'Senior 5 Stream 2', 'Senior 5 MEG', 'Senior 5 MCE', 'Senior 5 PCB',
    'Senior 5 Science Stream One', 'Senior 5 Science Stream Two',
    'Senior 6 MEG', 'Senior 6 MCE', 'Senior 6 PCB'
  ])
  union all select jsonb_array_elements_text(coalesce(content -> 'general' -> 'customClasses', '[]'::jsonb))
    from public.site_content where id = 'main'
  union all select value from public.site_content,
    lateral jsonb_each_text(coalesce(content -> 'general' -> 'classRenames', '{}'::jsonb))
    where id = 'main'
) class_values
where nullif(btrim(class_name), '') is not null
on conflict do nothing;

insert into public.school_courses (name)
select min(btrim(course_name))
from (
  select subject as course_name from public.profiles
  union all select subject from public.elearning_assignments
  union all select subject from public.elearning_quizzes
  union all select subject from public.elearning_notes
  union all select 'BIO'
  union all select 'MATH'
  union all select 'ENG'
) course_values
where nullif(btrim(course_name), '') is not null
group by lower(btrim(course_name))
on conflict do nothing;

create index if not exists elearning_assignments_class_idx on public.elearning_assignments (class);
create index if not exists elearning_quizzes_class_idx on public.elearning_quizzes (class);
create index if not exists elearning_notes_class_idx on public.elearning_notes (class);
create index if not exists elearning_submissions_student_idx on public.elearning_submissions (student_id);
create index if not exists elearning_quiz_results_student_idx on public.elearning_quiz_results (student_id);
create index if not exists attendance_records_class_date_idx on public.attendance_records (class, attendance_date);
create index if not exists school_updates_created_at_idx on public.school_updates (created_at desc);
create index if not exists school_updates_active_announcement_idx on public.school_updates (type, is_active) where type = 'announcement';

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function public.current_student_class()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select class from public.profiles where id = (select auth.uid()) and role = 'student'
$$;

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

create or replace function public.student_has_resource_access(p_resource_type text, p_resource_id text, p_key_hash text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.learning_resource_access as resource_access
    where resource_access.student_id = (select auth.uid())
      and resource_access.resource_type = p_resource_type
      and resource_access.resource_id = p_resource_id
      and resource_access.key_hash = p_key_hash
  )
$$;

revoke all on function public.student_has_resource_access(text, text, text) from public, anon;
grant execute on function public.student_has_resource_access(text, text, text) to authenticated;

create or replace function public.list_student_quizzes()
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', quiz.id,
    'title', quiz.title,
    'class', quiz.class,
    'subject', quiz.subject,
    'deadline', quiz.deadline,
    'questionCount', jsonb_array_length(quiz.questions),
    'requiresAccessKey', coalesce(quiz.paper_settings ->> 'accessKeyHash', '') <> '',
    'paperSettings', quiz.paper_settings - 'accessKeyHash'
  )
  from public.elearning_quizzes as quiz
  where public.current_user_role() = 'student'
    and quiz.class = public.current_student_class()
$$;

create or replace function public.open_student_quiz(p_quiz_id text, p_key_hash text default '')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quiz public.elearning_quizzes%rowtype;
  v_expected_key_hash text;
begin
  if public.current_user_role() <> 'student' then
    raise exception 'Student access is required.' using errcode = '42501';
  end if;

  select * into v_quiz
  from public.elearning_quizzes as quiz
  where quiz.id = p_quiz_id and quiz.class = public.current_student_class();
  if not found then
    raise exception 'This assessment is not available for your class.' using errcode = '42501';
  end if;
  if v_quiz.deadline is not null and v_quiz.deadline < current_date then
    raise exception 'The deadline for this assessment has passed.' using errcode = '42501';
  end if;

  v_expected_key_hash := coalesce(v_quiz.paper_settings ->> 'accessKeyHash', '');
  if v_expected_key_hash <> '' and (p_key_hash is null or p_key_hash <> v_expected_key_hash) then
    raise exception 'That key does not match this assessment.' using errcode = '42501';
  end if;

  if v_expected_key_hash <> '' then
    insert into public.learning_resource_access (student_id, resource_type, resource_id, key_hash)
    values ((select auth.uid()), 'quiz', v_quiz.id, v_expected_key_hash)
    on conflict (student_id, resource_type, resource_id)
    do update set key_hash = excluded.key_hash, updated_at = now();
  end if;

  return jsonb_build_object(
    'id', v_quiz.id,
    'title', v_quiz.title,
    'class', v_quiz.class,
    'subject', v_quiz.subject,
    'questions', v_quiz.questions,
    'deadline', v_quiz.deadline,
    'paperSettings', v_quiz.paper_settings - 'accessKeyHash'
  );
end;
$$;

create or replace function public.list_student_notes()
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', note.id,
    'title', note.title,
    'class', note.class,
    'subject', note.subject,
    'description', note.description,
    'targetClasses', note.target_classes,
    'fileName', note.file_name,
    'datePosted', note.date_posted,
    'requiresAccessKey', coalesce(note.access_key_hash, '') <> ''
  )
  from public.elearning_notes as note
  where public.current_user_role() = 'student'
    and (
      note.class = public.current_student_class()
      or public.current_student_class() = any(note.target_classes)
      or (select auth.uid()) = any(note.target_student_ids)
    )
$$;

create or replace function public.open_student_note(p_note_id text, p_key_hash text default '')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note public.elearning_notes%rowtype;
  v_expected_key_hash text;
begin
  if public.current_user_role() <> 'student' then
    raise exception 'Student access is required.' using errcode = '42501';
  end if;

  select * into v_note
  from public.elearning_notes as note
  where note.id = p_note_id
    and (
      note.class = public.current_student_class()
      or public.current_student_class() = any(note.target_classes)
      or (select auth.uid()) = any(note.target_student_ids)
    );
  if not found then
    raise exception 'This resource is not available for your account.' using errcode = '42501';
  end if;

  v_expected_key_hash := coalesce(v_note.access_key_hash, '');
  if v_expected_key_hash <> '' and (p_key_hash is null or p_key_hash <> v_expected_key_hash) then
    raise exception 'That key does not match this resource.' using errcode = '42501';
  end if;

  if v_expected_key_hash <> '' then
    insert into public.learning_resource_access (student_id, resource_type, resource_id, key_hash)
    values ((select auth.uid()), 'note', v_note.id, v_expected_key_hash)
    on conflict (student_id, resource_type, resource_id)
    do update set key_hash = excluded.key_hash, updated_at = now();
  end if;

  return jsonb_build_object('filePath', v_note.file_path, 'fileName', v_note.file_name);
end;
$$;

revoke all on function public.list_student_quizzes() from public, anon;
revoke all on function public.open_student_quiz(text, text) from public, anon;
revoke all on function public.list_student_notes() from public, anon;
revoke all on function public.open_student_note(text, text) from public, anon;
grant execute on function public.list_student_quizzes() to authenticated;
grant execute on function public.open_student_quiz(text, text) to authenticated;
grant execute on function public.list_student_notes() to authenticated;
grant execute on function public.open_student_note(text, text) to authenticated;

create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = (select auth.uid())), false)
$$;

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

create or replace function public.rename_school_class(old_name text, new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'dos' and not public.is_school_admin() then
    raise exception 'Only the Director of Studies can rename classes.' using errcode = '42501';
  end if;
  if nullif(btrim(old_name), '') is null or nullif(btrim(new_name), '') is null then
    raise exception 'Both class names are required.' using errcode = '22023';
  end if;
  if old_name = new_name then
    return;
  end if;

  update public.school_classes set name = new_name where name = old_name;
  update public.profiles set class = new_name where role = 'student' and class = old_name;
  update public.elearning_assignments set class = new_name where class = old_name;
  update public.elearning_quizzes set class = new_name where class = old_name;
  update public.elearning_notes
    set class = case when class = old_name then new_name else class end,
        target_classes = array_replace(target_classes, old_name, new_name)
    where class = old_name or old_name = any(target_classes);
  update public.attendance_records set class = new_name where class = old_name;
  update public.elearning_submissions set class = new_name where class = old_name;
  update public.elearning_quiz_results set class = new_name where class = old_name;
end;
$$;

revoke all on function public.rename_school_class(text, text) from public;
grant execute on function public.rename_school_class(text, text) to authenticated;

create or replace function public.delete_school_class(class_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'dos' and not public.is_school_admin() then
    raise exception 'Only the Director of Studies can remove classes.' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where class = class_name)
    or exists (select 1 from public.elearning_assignments where class = class_name)
    or exists (select 1 from public.elearning_quizzes where class = class_name)
    or exists (select 1 from public.elearning_notes where class = class_name or class_name = any(target_classes))
    or exists (select 1 from public.attendance_records where class = class_name)
    or exists (select 1 from public.elearning_submissions where class = class_name)
    or exists (select 1 from public.elearning_quiz_results where class = class_name) then
    raise exception 'This class is still assigned to students or learning records. Reassign those records before removing it.' using errcode = '23503';
  end if;

  delete from public.school_classes where name = class_name;
end;
$$;

create or replace function public.rename_school_course(old_name text, new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'dos' and not public.is_school_admin() then
    raise exception 'Only the Director of Studies can rename courses.' using errcode = '42501';
  end if;
  if nullif(btrim(old_name), '') is null or nullif(btrim(new_name), '') is null then
    raise exception 'Both course names are required.' using errcode = '22023';
  end if;
  if old_name = new_name then
    return;
  end if;

  update public.school_courses set name = new_name where name = old_name;
  update public.profiles set subject = new_name where subject = old_name;
  update public.elearning_assignments set subject = new_name where subject = old_name;
  update public.elearning_quizzes set subject = new_name where subject = old_name;
  update public.elearning_notes set subject = new_name where subject = old_name;
end;
$$;

create or replace function public.delete_school_course(course_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'dos' and not public.is_school_admin() then
    raise exception 'Only the Director of Studies can remove courses.' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where subject = course_name)
    or exists (select 1 from public.elearning_assignments where subject = course_name)
    or exists (select 1 from public.elearning_quizzes where subject = course_name)
    or exists (select 1 from public.elearning_notes where subject = course_name) then
    raise exception 'This course is still assigned to students or learning records. Reassign those records before removing it.' using errcode = '23503';
  end if;

  delete from public.school_courses where name = course_name;
end;
$$;

revoke all on function public.delete_school_class(text) from public;
revoke all on function public.rename_school_course(text, text) from public;
revoke all on function public.delete_school_course(text) from public;
grant execute on function public.delete_school_class(text) to authenticated;
grant execute on function public.rename_school_course(text, text) to authenticated;
grant execute on function public.delete_school_course(text) to authenticated;

create or replace function public.create_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, email, reg_number, class, start_year, is_admin)
  values (
    new.id,
    case when lower(new.email) = 'yvesniyonkuru2022@gmail.com' then 'dos' else 'student' end,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'reg_number',
    new.raw_user_meta_data ->> 'class',
    nullif(new.raw_user_meta_data ->> 'start_year', '')::integer,
    lower(new.email) = 'yvesniyonkuru2022@gmail.com'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_student_profile on auth.users;
create trigger on_auth_user_created_student_profile
  after insert on auth.users
  for each row execute procedure public.create_student_profile();

update public.profiles
set role = 'dos', is_admin = true
where lower(email) = 'yvesniyonkuru2022@gmail.com';

alter table public.profiles enable row level security;
alter table public.elearning_assignments enable row level security;
alter table public.elearning_quizzes enable row level security;
alter table public.elearning_notes enable row level security;
alter table public.elearning_submissions enable row level security;
alter table public.elearning_quiz_results enable row level security;
alter table public.attendance_records enable row level security;
alter table public.site_content enable row level security;
alter table public.school_events enable row level security;
alter table public.school_updates enable row level security;
alter table public.school_classes enable row level security;
alter table public.school_courses enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.elearning_assignments to authenticated;
grant select, insert, update, delete on public.elearning_quizzes to authenticated;
grant select, insert, update, delete on public.elearning_notes to authenticated;
grant select, insert, update, delete on public.elearning_submissions to authenticated;
grant select, insert, update, delete on public.elearning_quiz_results to authenticated;
grant select, insert, update, delete on public.attendance_records to authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant select on public.school_events to anon, authenticated;
grant insert, update, delete on public.school_events to authenticated;
grant select on public.school_updates to anon, authenticated;
grant insert, update, delete on public.school_updates to authenticated;
grant select on public.school_classes to anon, authenticated;
grant insert, update, delete on public.school_classes to authenticated;
grant select, insert, update, delete on public.school_courses to authenticated;

drop policy if exists "school_classes_dos_insert" on public.school_classes;
create policy "school_classes_dos_insert" on public.school_classes
  for insert to authenticated
  with check (public.current_user_role() = 'dos' or public.is_school_admin());

drop policy if exists "school_courses_dos_insert" on public.school_courses;
create policy "school_courses_dos_insert" on public.school_courses
  for insert to authenticated
  with check (public.current_user_role() = 'dos' or public.is_school_admin());

drop policy if exists "profiles_select_self_or_teacher" on public.profiles;
create policy "profiles_select_self_or_teacher" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.current_user_role() in ('teacher', 'dos') or public.is_school_admin());

drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using (public.is_school_admin())
  with check (public.is_school_admin());

drop policy if exists "assignments_select_by_role" on public.elearning_assignments;
create policy "assignments_select_by_role" on public.elearning_assignments
  for select to authenticated
  using (
    public.current_user_role() = 'dos' or public.is_school_admin()
    or (public.current_user_role() = 'teacher' and created_by = (select auth.uid()))
    or (
      public.current_user_role() = 'student'
      and class = public.current_student_class()
      and (
        coalesce(paper_settings ->> 'accessKeyHash', '') = ''
        or public.student_has_resource_access('quiz', id, paper_settings ->> 'accessKeyHash')
      )
    )
  );

drop policy if exists "assignments_teacher_manage" on public.elearning_assignments;
create policy "assignments_teacher_manage" on public.elearning_assignments
  for all to authenticated
  using (public.current_user_role() = 'dos' or public.is_school_admin() or (public.current_user_role() = 'teacher' and created_by = (select auth.uid())))
  with check (public.current_user_role() = 'dos' or public.is_school_admin() or (public.current_user_role() = 'teacher' and created_by = (select auth.uid())));

drop policy if exists "quizzes_select_by_role" on public.elearning_quizzes;
create policy "quizzes_select_by_role" on public.elearning_quizzes
  for select to authenticated
  using (
    public.current_user_role() = 'dos' or public.is_school_admin()
    or (public.current_user_role() = 'teacher' and created_by = (select auth.uid()))
    or (public.current_user_role() = 'student' and class = public.current_student_class())
  );

drop policy if exists "quizzes_teacher_manage" on public.elearning_quizzes;
create policy "quizzes_teacher_manage" on public.elearning_quizzes
  for all to authenticated
  using (public.current_user_role() = 'dos' or public.is_school_admin() or (public.current_user_role() = 'teacher' and created_by = (select auth.uid())))
  with check (public.current_user_role() = 'dos' or public.is_school_admin() or (public.current_user_role() = 'teacher' and created_by = (select auth.uid())));

drop policy if exists "quizzes_teacher_shared_exam_preview" on public.elearning_quizzes;
create policy "quizzes_teacher_shared_exam_preview" on public.elearning_quizzes
  for select to authenticated
  using (
    public.current_user_role() = 'teacher'
    and paper_settings ->> 'assessmentType' = 'exam'
    and coalesce(paper_settings ->> 'allowTeacherPreview', 'false') = 'true'
  );

drop policy if exists "notes_select_by_role" on public.elearning_notes;
create policy "notes_select_by_role" on public.elearning_notes
  for select to authenticated
  using (
    public.current_user_role() = 'dos' or public.is_school_admin()
    or (public.current_user_role() = 'teacher' and created_by = (select auth.uid()))
    or (
      public.current_user_role() = 'student'
      and coalesce(access_key_hash, '') = ''
      and
      cardinality(target_classes) = 0
      and cardinality(target_student_ids) = 0
      and class = public.current_student_class()
    )
    or (
      public.current_user_role() = 'student'
      and coalesce(access_key_hash, '') = ''
      and (
        public.current_student_class() = any(target_classes)
        or (select auth.uid()) = any(target_student_ids)
      )
    )
    or (
      public.current_user_role() = 'student'
      and (
        (class = public.current_student_class())
        or public.current_student_class() = any(target_classes)
        or (select auth.uid()) = any(target_student_ids)
      )
      and coalesce(access_key_hash, '') <> ''
      and public.student_has_resource_access('note', id, access_key_hash)
    )
  );

drop policy if exists "notes_teacher_manage" on public.elearning_notes;
create policy "notes_teacher_manage" on public.elearning_notes
  for all to authenticated
  using (public.current_user_role() = 'dos' or public.is_school_admin() or (public.current_user_role() = 'teacher' and created_by = (select auth.uid())))
  with check (public.current_user_role() = 'dos' or public.is_school_admin() or (public.current_user_role() = 'teacher' and created_by = (select auth.uid())));

drop policy if exists "submissions_select_by_role" on public.elearning_submissions;
create policy "submissions_select_by_role" on public.elearning_submissions
  for select to authenticated
  using (
    public.current_user_role() = 'dos'
    or public.is_school_admin()
    or student_id = (select auth.uid())
    or public.current_user_is_class_head(class)
  );

drop policy if exists "submissions_students_insert_own" on public.elearning_submissions;
create policy "submissions_students_insert_own" on public.elearning_submissions
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and class = public.current_student_class()
    and exists (
      select 1 from public.elearning_assignments
      where id = assignment_id and class = public.current_student_class()
        and (due_date is null or due_date >= current_date)
    )
    and (file_path is null or split_part(file_path, '/', 1) = (select auth.uid())::text)
  );

drop policy if exists "submissions_students_update_own" on public.elearning_submissions;
create policy "submissions_students_update_own" on public.elearning_submissions
  for update to authenticated
  using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid())
    and class = public.current_student_class()
    and exists (
      select 1 from public.elearning_assignments
      where id = assignment_id and class = public.current_student_class()
        and (due_date is null or due_date >= current_date)
    )
    and (file_path is null or split_part(file_path, '/', 1) = (select auth.uid())::text)
  );

drop policy if exists "submissions_teacher_manage" on public.elearning_submissions;
drop policy if exists "submissions_dos_manage" on public.elearning_submissions;
create policy "submissions_dos_manage" on public.elearning_submissions
  for all to authenticated
  using (public.current_user_role() = 'dos' or public.is_school_admin())
  with check (public.current_user_role() = 'dos' or public.is_school_admin());

drop policy if exists "quiz_results_select_by_role" on public.elearning_quiz_results;
create policy "quiz_results_select_by_role" on public.elearning_quiz_results
  for select to authenticated
  using (public.current_user_role() in ('teacher', 'dos') or student_id = (select auth.uid()));

drop policy if exists "quiz_results_students_insert_own" on public.elearning_quiz_results;
create policy "quiz_results_students_insert_own" on public.elearning_quiz_results
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and class = public.current_student_class()
    and exists (
      select 1 from public.elearning_quizzes
      where id = quiz_id and class = public.current_student_class()
        and (deadline is null or deadline >= current_date)
    )
  );

drop policy if exists "quiz_results_teacher_manage" on public.elearning_quiz_results;
create policy "quiz_results_teacher_manage" on public.elearning_quiz_results
  for all to authenticated
  using (public.current_user_role() in ('teacher', 'dos'))
  with check (public.current_user_role() in ('teacher', 'dos'));

drop policy if exists "attendance_staff_manage_all_classes" on public.attendance_records;
create policy "attendance_staff_manage_all_classes" on public.attendance_records
  for all to authenticated
  using (public.current_user_role() = 'dos' or public.is_school_admin() or public.current_user_is_class_head(class))
  with check (public.current_user_role() = 'dos' or public.is_school_admin() or public.current_user_is_class_head(class));

drop policy if exists "attendance_students_read_own" on public.attendance_records;
create policy "attendance_students_read_own" on public.attendance_records
  for select to authenticated
  using (student_id = (select auth.uid()));

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read" on public.site_content
  for select to anon, authenticated
  using (true);

drop policy if exists "site_content_admin_manage" on public.site_content;
create policy "site_content_admin_manage" on public.site_content
  for all to authenticated
  using (public.is_school_admin())
  with check (public.is_school_admin());

drop policy if exists "school_events_public_read" on public.school_events;
create policy "school_events_public_read" on public.school_events
  for select to anon, authenticated
  using (true);

drop policy if exists "school_events_admin_manage" on public.school_events;
create policy "school_events_admin_manage" on public.school_events
  for all to authenticated
  using (public.is_school_admin())
  with check (public.is_school_admin());

drop policy if exists "school_updates_public_read" on public.school_updates;
create policy "school_updates_public_read" on public.school_updates
  for select to anon, authenticated
  using (type <> 'announcement' or is_active = true or public.is_school_admin());

drop policy if exists "school_updates_admin_manage" on public.school_updates;
create policy "school_updates_admin_manage" on public.school_updates
  for all to authenticated
  using (public.is_school_admin())
  with check (public.is_school_admin());

drop policy if exists "school_classes_public_read" on public.school_classes;
create policy "school_classes_public_read" on public.school_classes
  for select to anon, authenticated
  using (true);

drop policy if exists "school_classes_admin_manage" on public.school_classes;
create policy "school_classes_admin_manage" on public.school_classes
  for all to authenticated
  using (public.is_school_admin())
  with check (public.is_school_admin());

drop policy if exists "school_classes_dos_assign_head" on public.school_classes;
create policy "school_classes_dos_assign_head" on public.school_classes
  for update to authenticated
  using (public.current_user_role() = 'dos')
  with check (public.current_user_role() = 'dos');

drop policy if exists "school_courses_staff_read" on public.school_courses;
create policy "school_courses_staff_read" on public.school_courses
  for select to authenticated
  using (public.current_user_role() in ('teacher', 'dos') or public.is_school_admin());

drop policy if exists "school_courses_admin_manage" on public.school_courses;
create policy "school_courses_admin_manage" on public.school_courses
  for all to authenticated
  using (public.is_school_admin())
  with check (public.is_school_admin());

insert into storage.buckets (id, name, public)
values ('elearning-notes', 'elearning-notes', false)
on conflict (id) do update set public = false, file_size_limit = 26214400, allowed_mime_types = null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-work', 'student-work', false, 26214400, null)
on conflict (id) do update set public = false, file_size_limit = 26214400, allowed_mime_types = null;

drop policy if exists "notes_storage_teacher_manage" on storage.objects;
create policy "notes_storage_teacher_manage" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'elearning-notes'
    and (
      public.current_user_role() = 'dos'
      or public.is_school_admin()
      or split_part(name, '/', 1) = (select auth.uid())::text
      or exists (
        select 1 from public.elearning_notes
        where file_path = name and created_by = (select auth.uid())
      )
    )
  )
  with check (
    bucket_id = 'elearning-notes'
    and (
      public.current_user_role() = 'dos'
      or split_part(name, '/', 1) = (select auth.uid())::text
    )
  );

drop policy if exists "student_work_upload_own" on storage.objects;
create policy "student_work_upload_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'student-work' and split_part(name, '/', 1) = (select auth.uid())::text);

drop policy if exists "student_work_read_own_or_class_head" on storage.objects;
create policy "student_work_read_own_or_class_head" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'student-work'
    and (
      split_part(name, '/', 1) = (select auth.uid())::text
      or public.current_user_role() = 'dos'
      or exists (
        select 1
        from public.profiles student
        join public.elearning_assignments assignment on assignment.id = split_part(name, '/', 2)
        where student.id::text = split_part(name, '/', 1)
          and assignment.class = student.class
          and public.current_user_is_class_head(student.class)
      )
    )
  );

drop policy if exists "student_work_delete_own_or_dos" on storage.objects;
create policy "student_work_delete_own_or_dos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'student-work' and (split_part(name, '/', 1) = (select auth.uid())::text or public.current_user_role() = 'dos' or public.is_school_admin()));

drop policy if exists "notes_storage_students_read_class_files" on storage.objects;
create policy "notes_storage_students_read_class_files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'elearning-notes'
    and exists (
      select 1 from public.elearning_notes n
      where n.file_path = name
        and (
          (
            cardinality(n.target_classes) = 0
            and cardinality(n.target_student_ids) = 0
            and n.class = public.current_student_class()
          )
          or public.current_student_class() = any(n.target_classes)
          or (select auth.uid()) = any(n.target_student_ids)
        )
    )
  );
