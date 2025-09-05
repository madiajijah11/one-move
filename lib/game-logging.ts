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
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    throw new Error(data?.error || "Failed to log game");
  }
  // Fire a global event so parent pages (e.g. /play) can react without prop drilling
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("game-logged", {
        detail: { row: data?.row, gameType: opts.gameType },
      })
    );
  }
  return data?.row;
}
