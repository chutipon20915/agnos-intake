"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Browser Supabase client (singleton).
//
// The whole app talks to Supabase directly from the browser using the public
// anon key — there is no custom Next.js API layer. Realtime (Postgres changes +
// broadcast + presence) is what powers the live sync between patient and staff.
// ============================================================================

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when both env vars are present. UI shows a setup banner when false. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Returns the shared Supabase client, or null when the project is not
 * configured yet (so the UI can render a helpful "connect Supabase" state
 * instead of crashing).
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 20 } },
    });
  }
  return client;
}
