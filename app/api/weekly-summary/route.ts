import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  computeWeeklyStats,
  buildWeeklyPrompt,
  type GameLogRow,
} from "@/lib/weekly-summary";
import { generateWeeklySummary } from "@/lib/ai";
import { guardWeeklyAI } from "@/lib/validation";

export const dynamic = "force-dynamic";

// week_start is startStr (7-day rolling window) for caching

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const supabase =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
      ? createSupabaseAdminClient()
      : createSupabaseServerClient();
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - 6); // 7-day window
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("refresh") === "1";

  // Fetch logs in window
  const { data: logs, error: logsError } = await supabase
    .from("game_logs")
    .select("date, game_type, score, reflection, duration_ms, moves")
    .eq("user_id", userId)
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date", { ascending: true });
  if (logsError)
    return NextResponse.json({ error: logsError.message }, { status: 500 });

  const rows = (logs || []) as GameLogRow[];
  const stats = computeWeeklyStats(rows, startStr, endStr);

  // Cache read & staleness check
  let cached: { summary: string; encouragement: string } | null = null;
  if (!force) {
    try {
      const { data: existing, error: existingErr } = await supabase
        .from("weekly_summaries")
        .select("summary, encouragement, total_games")
        .eq("user_id", userId)
        .eq("week_start", startStr)
        .maybeSingle();
      if (!existingErr && existing) {
        if (
          typeof existing.total_games === "number" &&
          existing.total_games === stats.totalGames
        ) {
          cached = {
            summary: existing.summary,
            encouragement: existing.encouragement,
          };
        }
      }
    } catch (e) {
      console.warn("weekly_summaries cache read failed", e);
    }
  }

  if (cached) {
    return NextResponse.json(
      { stats, ai: cached, hasAI: true, cached: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  // Build prompt & generate AI
  const prompt = buildWeeklyPrompt(rows, stats);
  const aiRaw = await generateWeeklySummary(prompt);
  const ai = guardWeeklyAI(aiRaw) || {
    summary: "Unable to generate a summary this time.",
    encouragement: "Keep showing up—consistency builds a sharper mind!",
  };

  // Write cache (best-effort)
  try {
    await supabase.from("weekly_summaries").upsert({
      user_id: userId,
      week_start: startStr,
      summary: ai.summary,
      encouragement: ai.encouragement,
      total_games: stats.totalGames,
    });
  } catch (e) {
    console.warn("weekly_summaries upsert failed", e);
  }

  return NextResponse.json(
    { stats, ai, hasAI: !!ai, cached: false },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
