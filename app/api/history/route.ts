import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const daysParam = url.searchParams.get("days");
  const days = Math.min(
    60,
    Math.max(1, daysParam ? parseInt(daysParam, 10) : 14)
  );
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  const startStr = formatDate(start);

  const supabase =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
      ? createSupabaseAdminClient()
      : createSupabaseServerClient();
  const { data, error } = await supabase
    .from("game_logs")
    .select("date, score, completed")
    .eq("user_id", userId)
    .gte("date", startStr)
    .order("date", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const map = new Map<
    string,
    { date: string; score: number | null; completed: boolean }
  >();
  data?.forEach((r) =>
    map.set(r.date, { date: r.date, score: r.score, completed: r.completed })
  );

  const daysArr: { date: string; score: number | null; completed: boolean }[] =
    [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = formatDate(d);
    const entry = map.get(key) || { date: key, score: null, completed: false };
    daysArr.push(entry);
  }

  // compute streak (consecutive from today backwards)
  let streak = 0;
  for (let i = daysArr.length - 1; i >= 0; i--) {
    const entry = daysArr[i];
    if (entry.completed) streak++;
    else break;
  }

  return NextResponse.json(
    { days: daysArr, streak },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
