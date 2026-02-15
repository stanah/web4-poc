import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for server-side usage (API routes, server components).
 * Uses the service role key for full access to the database.
 *
 * Note: Row types are defined in ./types.ts and applied at query call sites.
 * Run `supabase gen types` to regenerate full Database types after schema changes.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
