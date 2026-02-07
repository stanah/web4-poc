import { createBrowserClient } from "./create-client";

/**
 * Supabase client for browser (client-side) usage.
 * Uses NEXT_PUBLIC_* env vars exposed to the browser.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient();
}
