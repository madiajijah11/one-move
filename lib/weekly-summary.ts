import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface GameLogRow {
  date: string;
  game_type: string;
  score: number | null;
  reflection: string | null;
}

export interface WeeklyStats {
  rangeStart: string;
  rangeEnd: string;
  totalGames: number;
  daysPlayed: number;
  distinctGames: number;
  averageScore: number | null;
  bestScore: number | null;
  reflectionsUsed: number;
  gamesByType: Record<string, { count: number; avgScore: number | null }>;
}

export function computeWeeklyStats(
  rows: GameLogRow[],
  start: string,
  end: string
): WeeklyStats {
  const totalGames = rows.length;
  const byDate = new Map<string, GameLogRow[]>();
  const byType = new Map<string, GameLogRow[]>();
  let scoreSum = 0;
  let scoreCount = 0;
  let bestScore: number | null = null;
  let reflectionsUsed = 0;
  rows.forEach((r) => {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date)!.push(r);
    if (!byType.has(r.game_type)) byType.set(r.game_type, []);
    byType.get(r.game_type)!.push(r);
    if (r.score != null) {
      scoreSum += r.score;
      scoreCount++;
      if (bestScore == null || r.score > bestScore) bestScore = r.score;
    }
    if (r.reflection && r.reflection.trim().length > 0) reflectionsUsed++;
  });
  const gamesByType: WeeklyStats["gamesByType"] = {};
  byType.forEach((list, key) => {
    let s = 0,
      c = 0;
    list.forEach((l) => {
      if (l.score != null) {
        s += l.score;
        c++;
      }
    });
    gamesByType[key] = {
      count: list.length,
      avgScore: c ? +(s / c).toFixed(1) : null,
    };
  });
  return {
    rangeStart: start,
    rangeEnd: end,
    totalGames,
    daysPlayed: byDate.size,
    distinctGames: byType.size,
    averageScore: scoreCount ? +(scoreSum / scoreCount).toFixed(1) : null,
    bestScore,
    reflectionsUsed,
    gamesByType,
  };
}

export function buildWeeklyPrompt(
  rows: GameLogRow[],
  stats: WeeklyStats
): string {
  const lines = rows
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (r) =>
        `- ${r.date} ${r.game_type} score:${r.score ?? "-"}${
          r.reflection ? ` note:${r.reflection.substring(0, 80)}` : ""
        }`
    );
  return `You are a friendly coach. Summarize this week succinctly.
Range: ${stats.rangeStart} to ${stats.rangeEnd}
Total games: ${stats.totalGames}, days played: ${
    stats.daysPlayed
  }, distinct games: ${stats.distinctGames}.
Average score: ${stats.averageScore ?? "n/a"}, best score: ${
    stats.bestScore ?? "n/a"
  }.
Reflections written: ${stats.reflectionsUsed}.
Per game type: ${Object.entries(stats.gamesByType)
    .map(
      ([k, v]) =>
        `${k}(${v.count}${v.avgScore != null ? ` avg:${v.avgScore}` : ""})`
    )
    .join(", ")}
Raw log lines:\n${lines.join("\n")}
Return JSON with keys: summary, encouragement.
Encouragement: one sentence, motivating, positive, no fluff.`;
}
