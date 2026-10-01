-- Upgrade existing databases for the teacher dashboard.
-- Safe to run more than once in the Supabase SQL Editor.

alter table public.elearning_quizzes
  add column if not exists deadline date;

alter table public.school_classes
  add column if not exists head_teacher_id uuid
  references public.profiles (id) on delete set null;

create index if not exists school_classes_head_teacher_idx
  on public.school_classes (head_teacher_id);

notify pgrst, 'reload schema';