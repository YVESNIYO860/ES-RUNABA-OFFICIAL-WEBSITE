create table if not exists public.school_message_threads (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null check (btrim(subject) <> ''),
  last_message text not null default '',
  last_sender_id uuid references public.profiles (id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (user_a_id <> user_b_id)
);

create table if not exists public.school_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.school_message_threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (btrim(body) <> ''),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists school_message_threads_user_a_recent_idx
  on public.school_message_threads (user_a_id, last_message_at desc);
create index if not exists school_message_threads_user_b_recent_idx
  on public.school_message_threads (user_b_id, last_message_at desc);
create index if not exists school_messages_thread_created_idx
  on public.school_messages (thread_id, created_at);
create index if not exists school_messages_unread_thread_idx
  on public.school_messages (thread_id, sender_id) where read_at is null;

alter table public.school_message_threads enable row level security;
alter table public.school_messages enable row level security;

revoke all on public.school_message_threads, public.school_messages from public, anon, authenticated;
grant all privileges on public.school_message_threads, public.school_messages to service_role;

notify pgrst, 'reload schema';