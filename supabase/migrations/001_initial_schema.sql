-- ============================================================
-- keepingthem.net — initial schema
-- Run this in Supabase Studio SQL Editor
-- ============================================================

-- Create a dedicated schema for this project
create schema if not exists keepingthem;

-- ── RSVPs ────────────────────────────────────────────────────
create table keepingthem.rsvps (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),

  -- Memorial reference
  memorial_slug text not null,
  culture       text not null,

  -- Guest info
  name          text not null,
  email         text,
  phone         text,
  guests        text not null default '1',
  relation      text,
  message       text,

  -- Events attending
  attend_funeral      boolean default false,
  attend_reception    boolean default false,
  attend_thanksgiving boolean default false,
  send_flowers        boolean default false
);

-- Index for querying by memorial
create index on keepingthem.rsvps (memorial_slug, culture);

-- ── Row Level Security ────────────────────────────────────────
alter table keepingthem.rsvps enable row level security;

-- Anyone can insert (submit RSVP)
create policy "Anyone can submit an RSVP"
  on keepingthem.rsvps for insert
  with check (true);

-- Only authenticated users can read RSVPs (family access — future)
create policy "Authenticated users can read RSVPs"
  on keepingthem.rsvps for select
  using (auth.role() = 'authenticated');
