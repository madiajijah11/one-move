import { createClient } from "@supabase/supabase-js";

// Service role client (DO NOT import in client components).
// Looks for secure server-side key. If a mistakenly exposed NEXT_PUBLIC_ version exists, it will still work
// but you MUST rotate & move it to SUPABASE_SERVICE_ROLE_KEY.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (rotate if you previously exposed it)."
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
