ALTER TABLE keepingthem.thank_you_log ADD COLUMN IF NOT EXISTS recipient_phone text;
CREATE INDEX IF NOT EXISTS thank_you_log_phone_idx ON keepingthem.thank_you_log (recipient_phone);
