-- RSVP insert webhook via pg_net
-- Fires after each insert on keepingthem_rsvps
-- Calls the Netlify function which emails recipients via Resend

create extension if not exists pg_net;

create or replace function notify_rsvp_webhook()
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
  after insert on public.keepingthem_rsvps
  for each row execute function notify_rsvp_webhook();

-- Set the webhook secret (replace value with actual secret)
-- alter database postgres set app.rsvp_webhook_secret = 'your-secret-here';
