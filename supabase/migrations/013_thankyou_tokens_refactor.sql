-- Refactor thank_you_tokens: store recipient data fields instead of pre-rendered HTML.
-- The card is now rendered on page load from these fields, keeping the table small.

ALTER TABLE keepingthem.thank_you_tokens
  ADD COLUMN IF NOT EXISTS relation      text,
  ADD COLUMN IF NOT EXISTS events        text,
  ADD COLUMN IF NOT EXISTS contribution  text,
  ADD COLUMN IF NOT EXISTS message       text,
  ADD COLUMN IF NOT EXISTS deceased_name text,
  ADD COLUMN IF NOT EXISTS years         text,
  ADD COLUMN IF NOT EXISTS family_name   text,
  ADD COLUMN IF NOT EXISTS photo_url     text,
  ADD COLUMN IF NOT EXISTS signature_url text;

-- Drop the stored HTML column — cards are now rendered at read time.
ALTER TABLE keepingthem.thank_you_tokens DROP COLUMN IF EXISTS ecard_html;
