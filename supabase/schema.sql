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

create table if not exists public.elearning_notes (
  id text primary key,
  title text not null,
  class text not null,
  subject text not null default '',
  description text not null default '',
  file_name text not null,
  file_path text not null unique,
  date_posted text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.elearning_submissions (
  id text primary key,
  assignment_id text not null references public.elearning_assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_reg_number text not null,
  class text not null,
  submitted_at timestamptz not null default now()
);

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

create index if not exists elearning_assignments_class_idx on public.elearning_assignments (class);
create index if not exists elearning_quizzes_class_idx on public.elearning_quizzes (class);
create index if not exists elearning_notes_class_idx on public.elearning_notes (class);
create index if not exists elearning_submissions_student_idx on public.elearning_submissions (student_id);
create index if not exists elearning_quiz_results_student_idx on public.elearning_quiz_results (student_id);
create index if not exists attendance_records_class_date_idx on public.attendance_records (class, attendance_date);

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

create or replace function public.is_school_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = (select auth.uid())), false)
$$;

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
    case when lower(new.email) = 'yvesniyonkuru2022@gmail.com' then 'teacher' else 'student' end,
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
set role = 'teacher', is_admin = true
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
  using (public.current_user_role() = 'teacher' or class = public.current_student_class());

drop policy if exists "assignments_teacher_manage" on public.elearning_assignments;
create policy "assignments_teacher_manage" on public.elearning_assignments
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

drop policy if exists "quizzes_select_by_role" on public.elearning_quizzes;
create policy "quizzes_select_by_role" on public.elearning_quizzes
  for select to authenticated
  using (public.current_user_role() = 'teacher' or class = public.current_student_class());

drop policy if exists "quizzes_teacher_manage" on public.elearning_quizzes;
create policy "quizzes_teacher_manage" on public.elearning_quizzes
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

drop policy if exists "notes_select_by_role" on public.elearning_notes;
create policy "notes_select_by_role" on public.elearning_notes
  for select to authenticated
  using (public.current_user_role() = 'teacher' or class = public.current_student_class());

drop policy if exists "notes_teacher_manage" on public.elearning_notes;
create policy "notes_teacher_manage" on public.elearning_notes
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

drop policy if exists "submissions_select_by_role" on public.elearning_submissions;
create policy "submissions_select_by_role" on public.elearning_submissions
  for select to authenticated
  using (public.current_user_role() = 'teacher' or student_id = (select auth.uid()));

drop policy if exists "submissions_students_insert_own" on public.elearning_submissions;
create policy "submissions_students_insert_own" on public.elearning_submissions
  for insert to authenticated
  with check (student_id = (select auth.uid()) and class = public.current_student_class());

drop policy if exists "submissions_teacher_manage" on public.elearning_submissions;
create policy "submissions_teacher_manage" on public.elearning_submissions
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

drop policy if exists "quiz_results_select_by_role" on public.elearning_quiz_results;
create policy "quiz_results_select_by_role" on public.elearning_quiz_results
  for select to authenticated
  using (public.current_user_role() = 'teacher' or student_id = (select auth.uid()));

drop policy if exists "quiz_results_students_insert_own" on public.elearning_quiz_results;
create policy "quiz_results_students_insert_own" on public.elearning_quiz_results
  for insert to authenticated
  with check (student_id = (select auth.uid()) and class = public.current_student_class());

drop policy if exists "quiz_results_teacher_manage" on public.elearning_quiz_results;
create policy "quiz_results_teacher_manage" on public.elearning_quiz_results
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

drop policy if exists "attendance_staff_manage_all_classes" on public.attendance_records;
create policy "attendance_staff_manage_all_classes" on public.attendance_records
  for all to authenticated
  using (public.current_user_role() in ('teacher', 'dos') or public.is_school_admin())
  with check (public.current_user_role() in ('teacher', 'dos') or public.is_school_admin());

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

insert into storage.buckets (id, name, public)
values ('elearning-notes', 'elearning-notes', false)
on conflict (id) do update set public = false;

drop policy if exists "notes_storage_teacher_manage" on storage.objects;
create policy "notes_storage_teacher_manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'elearning-notes' and public.current_user_role() = 'teacher')
  with check (bucket_id = 'elearning-notes' and public.current_user_role() = 'teacher');

drop policy if exists "notes_storage_students_read_class_files" on storage.objects;
create policy "notes_storage_students_read_class_files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'elearning-notes'
    and exists (
      select 1 from public.elearning_notes n
      where n.file_path = name and n.class = public.current_student_class()
    )
  );
