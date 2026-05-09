import { createClient } from "@supabase/supabase-js";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/**
 * Backend-only Supabase client.
 * Uses service role key so it can write without relying on user auth.
 */
export const supabase = createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});
