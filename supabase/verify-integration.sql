-- ---------------------------------------------------------------------------
-- ES RUNABA e-learning: read-only integration health check.
--
-- Paste into the Supabase SQL Editor and run. Nothing is created, changed or
-- deleted - this only reports what the dashboard depends on. Run it any time
-- you want to confirm the integration is intact.
--
-- Anything reported as MISSING is fixed by running 2026-09-add-class-heads.sql.
-- ---------------------------------------------------------------------------

with required_column (tbl, col) as (
  values
    ('profiles', 'id'),
    ('profiles', 'role'),
    ('profiles', 'full_name'),
    ('profiles', 'email'),
    ('profiles', 'username'),
    ('profiles', 'subject'),
    ('profiles', 'is_admin'),
    ('school_classes', 'name'),
    ('school_classes', 'head_teacher_id')
),
column_report as (
  select
    'column ' || r.tbl || '.' || r.col as check_name,
    case when c.column_name is null then 'MISSING - run the migration' else 'OK' end as status
  from required_column r
  left join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name = r.tbl
   and c.column_name = r.col
),
other_report as (
  select
    'trigger on_auth_user_created_student_profile' as check_name,
    case when exists (
      select 1 from pg_trigger
      where tgrelid = 'auth.users'::regclass
        and tgname = 'on_auth_user_created_student_profile'
    ) then 'OK' else 'MISSING - new accounts would get no profile row' end as status
  union all
  select
    'function assign_school_class_head(text, uuid)',
    case when exists (
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'assign_school_class_head'
    ) then 'OK' else 'MISSING - run the migration' end
  union all
  select
    'constraint profiles_role_check allows teacher and dos',
    case when exists (
      select 1 from pg_constraint
      where conname = 'profiles_role_check'
        and pg_get_constraintdef(oid) like '%teacher%'
        and pg_get_constraintdef(oid) like '%dos%'
    ) then 'OK' else 'MISSING - run the migration' end
  union all
  select
    'policy profiles_select_self_or_teacher',
    case when exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'profiles'
        and policyname = 'profiles_select_self_or_teacher'
    ) then 'OK' else 'MISSING - the staff list would not load' end
)
select check_name, status
from column_report
union all
select check_name, status
from other_report
order by (status <> 'OK') desc, check_name;
