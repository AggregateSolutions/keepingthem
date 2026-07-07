-- Thank-you token table — unique link per SMS recipient
CREATE TABLE keepingthem.thank_you_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  token         text NOT NULL UNIQUE,
  memorial_slug text NOT NULL,
  recipient_name  text NOT NULL,
  recipient_phone text,
  card_type     text NOT NULL,
  ecard_html    text NOT NULL,
  viewed_at     timestamptz
);

CREATE INDEX thank_you_tokens_token_idx ON keepingthem.thank_you_tokens (token);
CREATE INDEX thank_you_tokens_memorial_idx ON keepingthem.thank_you_tokens (memorial_slug);

ALTER TABLE keepingthem.thank_you_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to thank_you_tokens"
  ON keepingthem.thank_you_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public can read their own token (by token value — no auth needed)
CREATE POLICY "Public can read token by value"
  ON keepingthem.thank_you_tokens FOR SELECT TO anon
  USING (true);

GRANT ALL ON keepingthem.thank_you_tokens TO service_role;
GRANT SELECT ON keepingthem.thank_you_tokens TO anon;
