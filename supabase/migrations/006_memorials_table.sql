-- Run this in Supabase SQL Editor
create table if not exists keepingthem_memorials (
  id          bigint generated always as identity primary key,
  slug        text unique not null,
  culture     text not null default 'akan',
  config      jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast slug lookups
create index if not exists keepingthem_memorials_slug_idx on keepingthem_memorials (slug);

-- Enable RLS
alter table keepingthem_memorials enable row level security;

-- Public can read memorials (needed for memorial pages to load config)
create policy "Public can read memorials"
  on keepingthem_memorials for select
  using (true);

-- Only service role (server-side) can insert/update/delete
create policy "Service role can write memorials"
  on keepingthem_memorials for all
  using (auth.role() = 'service_role');
