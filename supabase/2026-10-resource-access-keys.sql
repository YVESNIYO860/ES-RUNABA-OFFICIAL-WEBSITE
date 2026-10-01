alter table public.elearning_notes
  add column if not exists access_key_hash text not null default '';

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

revoke all on function public.student_has_resource_access(text, text, text) from public, anon;
revoke all on function public.list_student_quizzes() from public, anon;
revoke all on function public.open_student_quiz(text, text) from public, anon;
revoke all on function public.list_student_notes() from public, anon;
revoke all on function public.open_student_note(text, text) from public, anon;
grant execute on function public.student_has_resource_access(text, text, text) to authenticated;
grant execute on function public.list_student_quizzes() to authenticated;
grant execute on function public.open_student_quiz(text, text) to authenticated;
grant execute on function public.list_student_notes() to authenticated;
grant execute on function public.open_student_note(text, text) to authenticated;

drop policy if exists "quizzes_select_by_role" on public.elearning_quizzes;
create policy "quizzes_select_by_role" on public.elearning_quizzes
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

drop policy if exists "notes_select_by_role" on public.elearning_notes;
create policy "notes_select_by_role" on public.elearning_notes
  for select to authenticated
  using (
    public.current_user_role() = 'dos' or public.is_school_admin()
    or (public.current_user_role() = 'teacher' and created_by = (select auth.uid()))
    or (
      public.current_user_role() = 'student'
      and coalesce(access_key_hash, '') = ''
      and cardinality(target_classes) = 0
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
        class = public.current_student_class()
        or public.current_student_class() = any(target_classes)
        or (select auth.uid()) = any(target_student_ids)
      )
      and coalesce(access_key_hash, '') <> ''
      and public.student_has_resource_access('note', id, access_key_hash)
    )
  );