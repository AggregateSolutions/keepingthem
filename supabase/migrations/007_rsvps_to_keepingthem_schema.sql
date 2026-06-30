-- ============================================================
-- Move RSVPs back into keepingthem schema now that
-- PGRST_DB_SCHEMAS includes keepingthem
-- ============================================================

-- Drop trigger before moving table
drop trigger if exists on_rsvp_insert on public.keepingthem_rsvps;
drop function if exists notify_rsvp_webhook();

-- Move table back into keepingthem schema
alter table public.keepingthem_rsvps set schema keepingthem;
alter table keepingthem.keepingthem_rsvps rename to rsvps;

-- Grant access
grant insert on keepingthem.rsvps to anon;
grant select on keepingthem.rsvps to anon;

-- Recreate RLS policies
drop policy if exists "Anyone can submit an RSVP"     on keepingthem.rsvps;
drop policy if exists "Authenticated users can read RSVPs" on keepingthem.rsvps;
drop policy if exists "Anyone can read tributes"      on keepingthem.rsvps;

create policy "Anyone can submit an RSVP"
  on keepingthem.rsvps for insert
  to anon
  with check (true);

create policy "Authenticated users can read RSVPs"
  on keepingthem.rsvps for select
  using (auth.role() = 'authenticated');

create policy "Anyone can read tributes"
  on keepingthem.rsvps for select
  to anon
  using (message is not null and message <> '');

-- Recreate webhook trigger on new location
create or replace function keepingthem.notify_rsvp_webhook()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://keepingthem.netlify.app/.netlify/functions/rsvp-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.rsvp_webhook_secret')
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  return NEW;
end;
$$ language plpgsql;

create trigger on_rsvp_insert
  after insert on keepingthem.rsvps
  for each row execute function keepingthem.notify_rsvp_webhook();
