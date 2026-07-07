-- ============================================================
-- Donors table — manual contacts added by memorial admin
-- ============================================================
CREATE TABLE keepingthem.donors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  memorial_slug text NOT NULL,
  name        text NOT NULL,
  email       text,
  phone       text,
  note        text  -- gift description e.g. "White lily arrangement", "$100 donation"
);

-- Index for fast lookup by memorial
CREATE INDEX donors_memorial_slug_idx ON keepingthem.donors (memorial_slug);

-- RLS
ALTER TABLE keepingthem.donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to donors"
  ON keepingthem.donors FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- Thank-you log — tracks who was sent a card and when
-- ============================================================
CREATE TABLE keepingthem.thank_you_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at       timestamptz NOT NULL DEFAULT now(),
  memorial_slug text NOT NULL,
  recipient_name  text NOT NULL,
  recipient_email text,
  card_type     text NOT NULL, -- 'attendance', 'donor', 'combined'
  subject       text
);

CREATE INDEX thank_you_log_memorial_slug_idx ON keepingthem.thank_you_log (memorial_slug);
CREATE INDEX thank_you_log_email_idx ON keepingthem.thank_you_log (recipient_email);

ALTER TABLE keepingthem.thank_you_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to thank_you_log"
  ON keepingthem.thank_you_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grants
GRANT ALL ON keepingthem.donors TO service_role;
GRANT ALL ON keepingthem.thank_you_log TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA keepingthem
  GRANT ALL ON TABLES TO service_role;
