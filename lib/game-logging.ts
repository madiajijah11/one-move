export async function logGameCompletion(opts: {
  gameType: string;
  score: number | null;
  reflection?: string;
  duration_ms?: number | null;
  moves?: number | null;
}) {
  const res = await fetch("/api/log-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gameType: opts.gameType,
      score: opts.score,
      reflection: opts.reflection,
      duration_ms: opts.duration_ms,
      moves: opts.moves,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to log game");
  }
}
