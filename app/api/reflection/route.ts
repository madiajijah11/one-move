import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { guardReflectionPatch } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const payload = guardReflectionPatch(raw);
  if (!payload)
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const { date, reflection } = payload;
  const supabase =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
      ? createSupabaseAdminClient()
      : createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_logs")
    .update({ reflection })
    .eq("user_id", userId)
    .eq("date", date)
    .select("id, date, reflection")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, row: data });
}
