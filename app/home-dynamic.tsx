"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

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

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/today");
        if (res.status === 401) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (active) setToday(data.today);
        // After we know today's status, we can fetch weekly summary
        if (data.today || true) {
          // always fetch for now; could gate by played days
          setWeeklyLoading(true);
          try {
            const w = await fetch("/api/weekly-summary");
            if (w.ok) {
              const json = await w.json();
              if (active) setWeekly(json);
            }
          } catch (e: any) {
            // ignore
          } finally {
            if (active) setWeeklyLoading(false);
          }
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
                You already finished today’s{" "}
                <span className="font-medium">{today.game_type}</span>.
              </p>
              <div className="text-sm flex gap-4">
                <div>
                  <span className="font-medium">Score:</span>{" "}
                  {today.score ?? "-"}
                </div>
              </div>
              {today.reflection && (
                <div>
                  <span className="font-medium">Reflection:</span>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {today.reflection}
                  </p>
                </div>
              )}
              {!today.reflection && (
                <p className="italic text-muted-foreground">
                  (No reflection saved)
                </p>
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
              </div>
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
