alter table public.elearning_quizzes
  add column if not exists paper_settings jsonb not null default '{}'::jsonb;

drop policy if exists "quizzes_teacher_shared_exam_preview" on public.elearning_quizzes;
create policy "quizzes_teacher_shared_exam_preview" on public.elearning_quizzes
  for select to authenticated
  using (
    public.current_user_role() = 'teacher'
    and paper_settings ->> 'assessmentType' = 'exam'
    and coalesce(paper_settings ->> 'allowTeacherPreview', 'false') = 'true'
  );

notify pgrst, 'reload schema';