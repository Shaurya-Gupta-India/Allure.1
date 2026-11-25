-- ALLURE initial schema. Run this in Supabase Dashboard > SQL Editor.
-- All user-owned rows and image objects are protected by RLS.

create extension if not exists pgcrypto;

create table if not exists public.analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    image_path text not null,
    status text not null default 'awaiting_models'
        check (status in ('awaiting_models', 'processing', 'completed', 'failed')),
    findings jsonb not null default '[]'::jsonb,
    recommendations jsonb not null default '[]'::jsonb,
    model_version text,
    error_message text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint analyses_image_path_user_prefix check (split_part(image_path, '/', 1) = user_id::text)
);

create index if not exists analyses_user_created_idx
    on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

drop policy if exists "Users can read their own analyses" on public.analyses;
create policy "Users can read their own analyses"
    on public.analyses for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own analyses" on public.analyses;
create policy "Users can create their own analyses"
    on public.analyses for insert to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own analyses" on public.analyses;
create policy "Users can update their own analyses"
    on public.analyses for update to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own analyses" on public.analyses;
create policy "Users can delete their own analyses"
    on public.analyses for delete to authenticated
    using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.analyses to authenticated;

-- Create the private bucket. The backend uses the user's JWT, not the service-role key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'skin-images',
    'skin-images',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The first folder in each object path is the authenticated user's UUID.
drop policy if exists "Users can upload their own skin images" on storage.objects;
create policy "Users can upload their own skin images"
    on storage.objects for insert to authenticated
    with check (
        bucket_id = 'skin-images'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
    );

drop policy if exists "Users can read their own skin images" on storage.objects;
create policy "Users can read their own skin images"
    on storage.objects for select to authenticated
    using (
        bucket_id = 'skin-images'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
    );

drop policy if exists "Users can delete their own skin images" on storage.objects;
create policy "Users can delete their own skin images"
    on storage.objects for delete to authenticated
    using (
        bucket_id = 'skin-images'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
    );
