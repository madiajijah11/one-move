import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Optional: declare dynamic to avoid caching
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
    }

    const gameType = String(body.gameType || "").trim();
    const score = body.score == null ? null : Number(body.score);
    const duration_ms =
      body.duration_ms == null ? null : Number(body.duration_ms);
    const moves = body.moves == null ? null : Number(body.moves);
    const reflectionRaw =
      typeof body.reflection === "string" ? body.reflection : "";
    const reflection = reflectionRaw.trim().slice(0, 1000) || null;

    if (!gameType) {
      return NextResponse.json({ error: "gameType required" }, { status: 400 });
    }
    if (score !== null && (Number.isNaN(score) || score < 0)) {
      return NextResponse.json(
        { error: "score must be a positive number" },
        { status: 400 }
      );
    }
    if (
      duration_ms !== null &&
      (Number.isNaN(duration_ms) || duration_ms < 0)
    ) {
      return NextResponse.json(
        { error: "duration_ms must be a positive number" },
        { status: 400 }
      );
    }
    if (moves !== null && (Number.isNaN(moves) || moves < 0)) {
      return NextResponse.json(
        { error: "moves must be a positive number" },
        { status: 400 }
      );
    }

    // Use service role if available (server-side only) to avoid needing a Supabase auth session mapping Clerk user.
    const hasServiceKey =
      !!process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    const supabase = hasServiceKey
      ? createSupabaseAdminClient()
      : createSupabaseServerClient();
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        { error: "supabase env missing" },
        { status: 500 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("game_logs")
      .upsert(
        {
          user_id: userId,
          date: today,
          game_type: gameType,
          completed: true,
          score,
          duration_ms,
          moves,
          reflection,
        },
        { onConflict: "user_id,date,game_type" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, row: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "unexpected error" },
      { status: 500 }
    );
  }
}
