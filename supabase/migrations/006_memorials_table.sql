-- ============================================================
-- keepingthem.net — memorials table
-- Run this in Supabase Studio SQL Editor
-- ============================================================

create table if not exists keepingthem.memorials (
  id          bigint generated always as identity primary key,
  slug        text unique not null,
  culture     text not null default 'akan',
  config      jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast slug lookups
create index if not exists memorials_slug_idx on keepingthem.memorials (slug);

-- Enable RLS
alter table keepingthem.memorials enable row level security;

-- Public can read memorials (needed for memorial pages to load config)
create policy "Public can read memorials"
  on keepingthem.memorials for select
  using (true);

-- Authenticated users (admin) can insert/update/delete
create policy "Authenticated users can write memorials"
  on keepingthem.memorials for all
  using (auth.role() = 'authenticated');
