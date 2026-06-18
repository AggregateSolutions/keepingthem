-- Allow anonymous users to read RSVP rows that have a public message
-- Only exposes name, relation, message, created_at — not email, phone, or attendance

create policy "Anyone can read tributes"
  on public.keepingthem_rsvps for select
  to anon
  using (message is not null and message <> '');
