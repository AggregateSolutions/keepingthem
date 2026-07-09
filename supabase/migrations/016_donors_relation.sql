-- Add relation field to donors so donor-only cards can show correct relation type
-- Run as supabase_admin (not postgres — postgres is not the table owner)
ALTER TABLE keepingthem.donors ADD COLUMN IF NOT EXISTS relation text;
