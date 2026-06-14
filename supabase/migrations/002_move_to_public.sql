-- Move rsvps to public schema to avoid PostgREST schema exposure config
-- Run this in Supabase Studio SQL Editor

alter table keepingthem.rsvps set schema public;

-- Update RLS policies on new location
drop policy if exists "Anyone can submit an RSVP" on public.rsvps;
drop policy if exists "Authenticated users can read RSVPs" on public.rsvps;

create policy "Anyone can submit an RSVP"
  on public.rsvps for insert
  with check (true);

create policy "Authenticated users can read RSVPs"
  on public.rsvps for select
  using (auth.role() = 'authenticated');
