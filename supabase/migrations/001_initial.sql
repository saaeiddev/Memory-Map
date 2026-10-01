-- Memory Map v1: secure per-user data model for Supabase.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '',
  memory_date date not null,
  date_precision text not null default 'exact' check (date_precision in ('exact','approximate','year')),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  city text not null default '',
  country text not null default '',
  emotion text not null,
  people jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  media jsonb not null default '[]'::jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists memories_user_date_idx on public.memories(user_id, memory_date desc);
create index if not exists memories_user_place_idx on public.memories(user_id, country, city);
create index if not exists memories_tags_gin_idx on public.memories using gin(tags);

-- Normalized extension tables for richer future people/tag relationships.
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text not null default 'Personal',
  photo_path text,
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.memory_people (
  memory_id uuid references public.memories(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key(memory_id, person_id)
);
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique(user_id, name)
);
create table if not exists public.memory_tags (
  memory_id uuid references public.memories(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key(memory_id, tag_id)
);
create table if not exists public.story_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  memory_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.memories enable row level security;
alter table public.people enable row level security;
alter table public.memory_people enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;
alter table public.story_collections enable row level security;

create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "memories own rows" on public.memories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "people own rows" on public.people for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory_people own rows" on public.memory_people for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tags own rows" on public.tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory_tags own rows" on public.memory_tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "stories own rows" on public.story_collections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('memory-media','memory-media',false,52428800)
on conflict (id) do update set public=false, file_size_limit=52428800;

create policy "memory media read own" on storage.objects for select to authenticated
using (bucket_id='memory-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "memory media insert own" on storage.objects for insert to authenticated
with check (bucket_id='memory-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "memory media update own" on storage.objects for update to authenticated
using (bucket_id='memory-media' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id='memory-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "memory media delete own" on storage.objects for delete to authenticated
using (bucket_id='memory-media' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name','Memory Explorer'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
