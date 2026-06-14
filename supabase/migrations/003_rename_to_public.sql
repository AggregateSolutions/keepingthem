-- Move rsvps back to public schema and rename to namespace it
-- Avoids Kong stripping Content-Profile header for custom schemas

alter table keepingthem.rsvps set schema public;
alter table public.rsvps rename to keepingthem_rsvps;

grant insert on public.keepingthem_rsvps to anon;

drop policy if exists "Anyone can submit an RSVP" on public.keepingthem_rsvps;
create policy "Anyone can submit an RSVP"
  on public.keepingthem_rsvps for insert
  to anon
  with check (true);

drop policy if exists "Authenticated users can read RSVPs" on public.keepingthem_rsvps;
create policy "Authenticated users can read RSVPs"
  on public.keepingthem_rsvps for select
  using (auth.role() = 'authenticated');
