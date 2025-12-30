import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supabase =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
      ? createSupabaseAdminClient()
      : createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("game_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .limit(1)
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    { today: data || null },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
