import { createClient } from "@supabase/supabase-js";

// Simple server client (stateless). If you later need RLS with auth tokens, pass service role on server only.
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, { auth: { persistSession: false } });
}
