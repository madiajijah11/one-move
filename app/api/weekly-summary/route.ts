import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  computeWeeklyStats,
  buildWeeklyPrompt,
  type GameLogRow,
} from "@/lib/weekly-summary";

export const dynamic = "force-dynamic";

async function maybeGenerateAI(
  prompt: string
): Promise<{ summary: string; encouragement: string } | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  let OpenAIClass: any;
  try {
    // attempt require to avoid type import resolution at build if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    OpenAIClass = require("openai").OpenAI;
  } catch {
    return null; // dependency not installed
  }
  try {
    const client = new OpenAIClass({ apiKey: process.env.OPENAI_API_KEY });
    const chat = await client.chat.completions.create({
      baseURL: "https://openrouter.ai/api/v1",
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 220,
    });
    const text = chat.choices[0]?.message?.content || "{}";
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
        if (parsed.summary && parsed.encouragement) return parsed;
      }
    } catch {
      /* ignore parse error */
    }
    return {
      summary: text.trim().slice(0, 300),
      encouragement: "Keep the streak going tomorrow!",
    };
  } catch (e) {
    console.error("AI generation failed", e);
    return null;
  }
}

export async function GET(_req: NextRequest) {
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
  const { data, error } = await supabase
    .from("game_logs")
    .select("date, game_type, score, reflection")
    .eq("user_id", userId)
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date", { ascending: true });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data || []) as GameLogRow[];
  const stats = computeWeeklyStats(rows, startStr, endStr);
  const prompt = buildWeeklyPrompt(rows, stats);
  const ai = await maybeGenerateAI(prompt);
  return NextResponse.json({ stats, ai, hasAI: !!ai });
}
