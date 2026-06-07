-- Owner-scoped SELECT on the media bucket.
-- Public image display works via the public-object URL without any SELECT
-- policy; this is needed so an authenticated owner can read/list their own
-- objects (e.g. the existence check during an upsert). Scoping it to the owner
-- (rather than a broad public policy) keeps the "public bucket listing"
-- security advisor clean.
create policy "media_owner_read" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
