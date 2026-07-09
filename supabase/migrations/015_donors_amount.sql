-- Add internal amount tracking to donors table
-- Amount is for family records only and never included in thank-you cards
ALTER TABLE keepingthem.donors
  ADD COLUMN IF NOT EXISTS amount text;
