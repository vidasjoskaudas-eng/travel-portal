-- Supabase Storage RLS policies for bucket: activity-media
-- Paste into Supabase SQL Editor (run as postgres/owner).

alter table storage.objects enable row level security;

-- INSERT
drop policy if exists "activity_media_insert_anon_authenticated" on storage.objects;
create policy "activity_media_insert_anon_authenticated"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'activity-media');

-- SELECT
drop policy if exists "activity_media_select_anon_authenticated" on storage.objects;
create policy "activity_media_select_anon_authenticated"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'activity-media');

-- DELETE
drop policy if exists "activity_media_delete_anon_authenticated" on storage.objects;
create policy "activity_media_delete_anon_authenticated"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'activity-media');

