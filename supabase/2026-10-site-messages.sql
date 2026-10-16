create table if not exists public.site_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  sender_email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.site_messages
  add column if not exists sender_phone text not null default '';

alter table public.site_messages enable row level security;
revoke all on public.site_messages from public, anon, authenticated;