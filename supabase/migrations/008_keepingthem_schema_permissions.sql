-- ============================================================
-- keepingthem schema — grants and permissions
-- Run as supabase_admin (schema owner)
-- ============================================================

-- Grant schema usage to all API roles
GRANT USAGE ON SCHEMA keepingthem TO anon, authenticated, service_role;

-- Grant full access to service_role (admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA keepingthem TO service_role;

-- Grant read access to anon and authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA keepingthem TO anon, authenticated;

-- Grant insert on rsvps to anon (RSVP form)
GRANT INSERT ON keepingthem.rsvps TO anon;

-- Ensure future tables also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA keepingthem
  GRANT SELECT ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA keepingthem
  GRANT ALL ON TABLES TO service_role;
