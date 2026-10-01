-- ES RUNABA e-learning: profile photos for students and staff.
-- Run this once in the Supabase SQL Editor (same project as the portal).
--
-- Students upload a photo from their profile tab. Staff photos are fetched
-- from their email address by the portal (Google/Gravatar via the avatar
-- service) and fall back to initials when no photo is found.

alter table public.profiles
  add column if not exists photo_url text not null default '';

-- Public-read bucket: avatars are shown across the dashboards and are served
-- through unguessable per-user paths.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "profile_photos_read" on storage.objects;
create policy "profile_photos_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'profile-photos');

-- Each account manages only the photo inside its own folder.
drop policy if exists "profile_photos_insert_own" on storage.objects;
create policy "profile_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and split_part(name, '/', 1) = (select auth.uid())::text);

drop policy if exists "profile_photos_update_own" on storage.objects;
create policy "profile_photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-photos' and split_part(name, '/', 1) = (select auth.uid())::text)
  with check (bucket_id = 'profile-photos' and split_part(name, '/', 1) = (select auth.uid())::text);

drop policy if exists "profile_photos_delete_own_or_staff" on storage.objects;
create policy "profile_photos_delete_own_or_staff" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (
      split_part(name, '/', 1) = (select auth.uid())::text
      or public.current_user_role() = 'dos'
      or public.is_school_admin()
    )
  );

-- Safe write path for the photo column: a signed-in user can only set the
-- photo on their own profile row (a plain "update own" policy would also
-- allow changing role or is_admin, so a controlled function is used instead).
create or replace function public.set_my_profile_photo(new_photo_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in is required.' using errcode = '42501';
  end if;

  update public.profiles
    set photo_url = coalesce(btrim(new_photo_url), '')
    where id = auth.uid();
end;
$$;

grant execute on function public.set_my_profile_photo(text) to authenticated;
