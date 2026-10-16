create table if not exists public.school_media_albums (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('gallery', 'student-life')),
  name text not null,
  category text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists school_media_albums_section_name_ci_idx
  on public.school_media_albums (section, lower(name));

insert into public.school_media_albums (section, name, category) values
  ('student-life', 'Debate Club', 'Club'),
  ('student-life', 'Environmental Club', 'Club'),
  ('student-life', 'Science Club', 'Club'),
  ('student-life', 'Traditional Dance', 'Culture'),
  ('student-life', 'Football', 'Sports'),
  ('student-life', 'Basketball', 'Sports'),
  ('student-life', 'Volleyball', 'Sports'),
  ('student-life', 'Girls'' Empowerment', 'Society')
on conflict do nothing;

create table if not exists public.school_media (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('gallery', 'student-life')),
  album_id uuid references public.school_media_albums (id) on delete set null,
  title text not null,
  caption text not null default '',
  category text not null default '',
  media_type text not null check (media_type in ('image', 'video')),
  file_path text not null unique,
  is_published boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.school_media
  add column if not exists album_name text not null default '',
  add column if not exists album_id uuid references public.school_media_albums (id) on delete set null;

insert into public.school_media_albums (section, name, category)
select section, min(btrim(album_name)), coalesce(max(category), '')
from public.school_media
where btrim(album_name) <> ''
group by section, lower(btrim(album_name))
on conflict do nothing;

update public.school_media as media
set album_id = album.id
from public.school_media_albums as album
where media.album_id is null
  and media.section = album.section
  and lower(btrim(media.album_name)) = lower(album.name);

create index if not exists school_media_section_created_at_idx
  on public.school_media (section, created_at desc);
create index if not exists school_media_album_id_idx on public.school_media (album_id);

alter table public.school_media enable row level security;
alter table public.school_media_albums enable row level security;

grant select on public.school_media to anon, authenticated;
grant insert, update, delete on public.school_media to authenticated;
grant select on public.school_media_albums to anon, authenticated;
grant insert, update, delete on public.school_media_albums to authenticated;

drop policy if exists "school_media_public_read" on public.school_media;
create policy "school_media_public_read" on public.school_media
  for select to anon, authenticated
  using (is_published or public.is_school_admin());

drop policy if exists "school_media_admin_manage" on public.school_media;
create policy "school_media_admin_manage" on public.school_media
  for all to authenticated
  using (public.current_user_role() = 'dos' or public.is_school_admin())
  with check (public.current_user_role() = 'dos' or public.is_school_admin());

drop policy if exists "school_media_albums_public_read" on public.school_media_albums;
create policy "school_media_albums_public_read" on public.school_media_albums
  for select to anon, authenticated
  using (true);

drop policy if exists "school_media_albums_admin_manage" on public.school_media_albums;
create policy "school_media_albums_admin_manage" on public.school_media_albums
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