// Lightweight runtime validation utilities (no external deps)

export function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export interface WeeklyAIShape {
  summary: string;
  encouragement: string;
}

export function guardWeeklyAI(val: unknown): WeeklyAIShape | null {
  if (!isRecord(val)) return null;
  const s = val.summary;
  const e = val.encouragement;
  if (typeof s === "string" && typeof e === "string") {
    return { summary: s, encouragement: e };
  }
  return null;
}

export interface WeeklyStatsDTO {
  stats: {
    rangeStart: string;
    rangeEnd: string;
    totalGames: number;
    daysPlayed: number;
    distinctGames: number;
    averageScore: number | null;
    bestScore: number | null;
    reflectionsUsed: number;
    gamesByType: Record<string, { count: number; avgScore: number | null }>;
    averageDurationMs?: number | null;
    averageMoves?: number | null;
  };
  ai: WeeklyAIShape | null;
  hasAI: boolean;
  cached?: boolean;
}

export function guardWeeklyStatsDTO(payload: unknown): WeeklyStatsDTO | null {
  if (!isRecord(payload)) return null;
  const stats = payload.stats;
  if (!isRecord(stats)) return null;
  if (
    typeof stats.rangeStart !== "string" ||
    typeof stats.rangeEnd !== "string"
  )
    return null;
  if (
    typeof stats.totalGames !== "number" ||
    typeof stats.daysPlayed !== "number"
  )
    return null;
  if (
    typeof stats.distinctGames !== "number" ||
    typeof stats.reflectionsUsed !== "number"
  )
    return null;
  if (!isRecord(stats.gamesByType)) return null;
  const aiVal = guardWeeklyAI(payload.ai);
  const hasAI = !!payload.hasAI && !!aiVal === true;
  return {
    stats: stats as WeeklyStatsDTO["stats"],
    ai: aiVal,
    hasAI,
    cached: typeof payload.cached === "boolean" ? payload.cached : undefined,
  };
}

// ---- Log Game Payload Validation ----
export interface LogGamePayload {
  gameType: string;
  score?: number | null;
  duration_ms?: number | null;
  moves?: number | null;
  reflection?: string | null;
}

export function guardLogGamePayload(val: unknown): LogGamePayload | null {
  if (!isRecord(val)) return null;
  const gameType = typeof val.gameType === "string" ? val.gameType.trim() : "";
  if (!gameType) return null;
  const num = (k: string): number | null | undefined => {
    if (!(k in val) || val[k] == null) return null;
    const n = Number(val[k]);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  };
  const score = num("score");
  const duration_ms = num("duration_ms");
  const moves = num("moves");
  const reflection =
    typeof val.reflection === "string"
      ? val.reflection.trim().slice(0, 1000) || null
      : undefined;
  return { gameType, score, duration_ms, moves, reflection };
}

// ---- Reflection Patch Payload ----
export interface ReflectionPatchPayload {
  date: string;
  reflection: string | null;
}

export function guardReflectionPatch(
  val: unknown
): ReflectionPatchPayload | null {
  if (!isRecord(val)) return null;
  const date = typeof val.date === "string" ? val.date.slice(0, 10) : "";
  if (!date) return null;
  const reflection =
    typeof val.reflection === "string"
      ? val.reflection.trim().slice(0, 1000) || null
      : null;
  return { date, reflection };
}
