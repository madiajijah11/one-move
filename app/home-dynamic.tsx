"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { earnedBadges } from "@/lib/badges";
import { useToast } from "@/components/toast-provider";

interface TodayLog {
  id: string;
  score: number | null;
  reflection: string | null;
  game_type: string;
}

interface WeeklyStats {
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
  ai: { summary: string; encouragement: string } | null;
  hasAI: boolean;
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col items-start min-w-[56px]">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}

export default function HomeDynamic() {
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<TodayLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStats | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [editingReflection, setEditingReflection] = useState(false);
  const [reflectionDraft, setReflectionDraft] = useState("");
  const [savingReflection, setSavingReflection] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/today");
        if (res.status === 401) {
          setLoading(false);
          return; // unauthenticated
        }
        const data = await res.json();
        if (active) setToday(data.today);
        try {
          const h = await fetch("/api/history?days=30");
          if (h.ok) {
            const hj = await h.json();
            if (active) setStreak(hj.streak);
          }
        } catch {}
        setWeeklyLoading(true);
        try {
          const w = await fetch("/api/weekly-summary");
          if (w.ok) {
            const json = await w.json();
            if (active) setWeekly(json);
          }
        } catch {
        } finally {
          if (active) setWeeklyLoading(false);
        }
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🧠 OneMove</h1>
        <p className="text-muted-foreground text-sm">
          One small puzzle a day. Grow your streak.
        </p>
      </header>
      <SignedOut>
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>Sign in to start your daily brain mini‑challenge.</p>
            <SignInButton>
              <Button className="w-full">Sign In</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </SignedOut>
      <SignedIn>
        {loading && (
          <div className="text-sm text-muted-foreground">Checking today...</div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !today && (
          <Card>
            <CardHeader>
              <CardTitle>Today’s Puzzle Ready</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>You haven’t played yet. Earn today’s streak point.</p>
              <Button asChild className="w-full">
                <Link href="/play">Play Now</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {!loading && today && (
          <Card>
            <CardHeader>
              <CardTitle>Nice work! ✅</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                You already finished today’s {""}
                <span className="font-medium">{today.game_type}</span>.
              </p>
              <div className="text-sm flex gap-4">
                <div>
                  <span className="font-medium">Score:</span>{" "}
                  {today.score ?? "-"}
                </div>
              </div>
              {today.reflection && !editingReflection && (
                <div>
                  <span className="font-medium">Reflection:</span>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {today.reflection}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setEditingReflection(true);
                      setReflectionDraft(today.reflection || "");
                    }}
                  >
                    Edit
                  </Button>
                </div>
              )}
              {!today.reflection && !editingReflection && (
                <p className="italic text-muted-foreground">
                  (No reflection saved)
                </p>
              )}
              {editingReflection && (
                <div className="space-y-2 w-full">
                  <textarea
                    className="w-full rounded border bg-background p-2 text-xs focus:outline-none focus:ring"
                    rows={3}
                    value={reflectionDraft}
                    placeholder="What was tricky? What pattern did you notice?"
                    onChange={(e) => setReflectionDraft(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={!reflectionDraft.trim() || savingReflection}
                      onClick={async () => {
                        const date = new Date().toISOString().slice(0, 10);
                        try {
                          setSavingReflection(true);
                          const res = await fetch("/api/reflection", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              date,
                              reflection: reflectionDraft,
                            }),
                          });
                          if (!res.ok) throw new Error("Save failed");
                          setToday((t) =>
                            t ? { ...t, reflection: reflectionDraft } : t
                          );
                          setEditingReflection(false);
                          push({
                            title: "Reflection saved",
                            description: "Nice insight logged.",
                            variant: "success",
                          });
                          try {
                            const w = await fetch("/api/weekly-summary");
                            if (w.ok) {
                              const json = await w.json();
                              setWeekly(json);
                            }
                          } catch {}
                        } catch (e: any) {
                          push({
                            title: "Could not save",
                            description: e.message || "Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setSavingReflection(false);
                        }
                      }}
                    >
                      {savingReflection ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingReflection(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/play">View Board</Link>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {weekly && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex justify-between items-center">
                <span>Weekly Summary</span>
                {weeklyLoading && (
                  <span className="text-xs text-muted-foreground">
                    Updating…
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-3">
                <Metric label="Days" value={weekly.stats.daysPlayed} />
                <Metric label="Games" value={weekly.stats.totalGames} />
                <Metric label="Avg" value={weekly.stats.averageScore ?? "-"} />
                <Metric label="Best" value={weekly.stats.bestScore ?? "-"} />
                <Metric
                  label="Reflections"
                  value={weekly.stats.reflectionsUsed}
                />
                {weekly.stats.averageDurationMs != null && (
                  <Metric
                    label="Avg ms"
                    value={weekly.stats.averageDurationMs}
                  />
                )}
                {weekly.stats.averageMoves != null && (
                  <Metric label="AvgMv" value={weekly.stats.averageMoves} />
                )}
                {streak != null && <Metric label="Streak" value={streak} />}
              </div>
              {streak != null && (
                <div className="flex flex-wrap gap-1">
                  {earnedBadges(streak).map((b) => (
                    <span
                      key={b.id}
                      className="px-2 py-0.5 rounded border bg-muted/50 text-[10px] font-medium"
                      title={`Unlocked at ${b.threshold} days`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
              {weekly.ai && (
                <div className="space-y-2">
                  <p className="text-muted-foreground leading-snug whitespace-pre-line text-[11px]">
                    {weekly.ai.summary}
                  </p>
                  <p className="font-medium text-[11px]">
                    {weekly.ai.encouragement}
                  </p>
                </div>
              )}
              {!weekly.ai && (
                <p className="italic text-muted-foreground text-[11px]">
                  AI summary unavailable.
                </p>
              )}
              <div className="space-y-1">
                <p className="font-medium text-[11px]">By Game:</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(weekly.stats.gamesByType).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded border px-2 py-1 flex justify-between items-center bg-muted/40"
                    >
                      <span className="truncate pr-2">{k}</span>
                      <span className="font-mono text-[10px]">
                        {v.count}
                        {v.avgScore != null ? `/${v.avgScore}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </SignedIn>
      <footer className="text-center text-xs text-muted-foreground pt-4">
        Built for consistency — one move at a time.
      </footer>
    </div>
  );
}
