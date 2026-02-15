import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Create or return a cached Supabase browser client using public (anon) key.
 * Singleton pattern avoids auth state inconsistencies and realtime subscription issues.
 * Row types are defined in ./types.ts and applied at query call sites.
 */
export function createBrowserClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  cachedClient = createClient(url, anonKey);
  return cachedClient;
}
