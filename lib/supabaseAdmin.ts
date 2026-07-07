import { createClient } from "@supabase/supabase-js";

// Server-side only — uses service role key to bypass RLS
// Points to /keepingthem/v1/ which Kong routes with Content-Profile: keepingthem
export function getAdminClient() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const url = `${baseUrl}/keepingthem/v1`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// Public client for keepingthem schema (anon key)
export function getKeepingthemClient() {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const url = `${baseUrl}/keepingthem/v1`;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
