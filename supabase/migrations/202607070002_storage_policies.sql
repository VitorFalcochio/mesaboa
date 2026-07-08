-- Yummi Storage setup for restaurant media

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-media',
  'restaurant-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Restaurant media is publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'restaurant-media');

create policy "Authenticated users can upload restaurant media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'restaurant-media'
  and owner = auth.uid()
);

create policy "Users can update their uploaded restaurant media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'restaurant-media'
  and (owner = auth.uid() or public.is_admin())
)
with check (
  bucket_id = 'restaurant-media'
  and (owner = auth.uid() or public.is_admin())
);

create policy "Users can delete their uploaded restaurant media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'restaurant-media'
  and (owner = auth.uid() or public.is_admin())
);
