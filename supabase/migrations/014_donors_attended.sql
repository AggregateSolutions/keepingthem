-- Add attended flag to donors table
-- Donors who were physically present but did not formally RSVP
ALTER TABLE keepingthem.donors
  ADD COLUMN IF NOT EXISTS attended boolean NOT NULL DEFAULT false;
