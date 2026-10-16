create table if not exists public.school_media (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('gallery', 'student-life')),
  title text not null,
  caption text not null default '',
  category text not null default '',
  media_type text not null check (media_type in ('image', 'video')),
  file_path text not null unique,
  is_published boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists school_media_section_created_at_idx
  on public.school_media (section, created_at desc);

alter table public.school_media enable row level security;

grant select on public.school_media to anon, authenticated;
grant insert, update, delete on public.school_media to authenticated;

drop policy if exists "school_media_public_read" on public.school_media;
create policy "school_media_public_read" on public.school_media
  for select to anon, authenticated
  using (is_published or public.is_school_admin());

drop policy if exists "school_media_admin_manage" on public.school_media;
create policy "school_media_admin_manage" on public.school_media
  for all to authenticated
  using (public.current_user_role() = 'dos' or public.is_school_admin())
  with check (public.current_user_role() = 'dos' or public.is_school_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('school-media', 'school-media', true, 104857600, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 104857600, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "school_media_storage_public_read" on storage.objects;
create policy "school_media_storage_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'school-media');

drop policy if exists "school_media_storage_admin_manage" on storage.objects;
create policy "school_media_storage_admin_manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'school-media' and (public.current_user_role() = 'dos' or public.is_school_admin()))
  with check (bucket_id = 'school-media' and (public.current_user_role() = 'dos' or public.is_school_admin()));

notify pgrst, 'reload schema';