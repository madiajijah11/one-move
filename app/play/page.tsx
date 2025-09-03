"use client";
import { useEffect, useState } from "react";
import { Suspense, lazy, useMemo } from "react";
import { getTodayGame } from "@/lib/games-registry";

function DynamicTodayGame() {
  const gameDef = useMemo(() => getTodayGame(), []);
  const LazyComp = useMemo(() => lazy(gameDef.component), [gameDef.id]);
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading game...</div>
      }
    >
      <LazyComp />
    </Suspense>
  );
}
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TodayLog {
  id: string;
  score: number | null;
  reflection: string | null;
  game_type: string;
}

interface HistoryDay {
  date: string;
  score: number | null;
  completed: boolean;
}

function StreakCalendar({
  days,
  streak,
}: {
  days: HistoryDay[];
  streak: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm flex justify-between items-center">
          <span>
            Streak: <span className="font-mono">{streak}</span> day
            {streak === 1 ? "" : "s"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-[10px]">
          {days.map((d) => {
            const dateObj = new Date(d.date);
            const label = dateObj.getDate();
            return (
              <div
                key={d.date}
                className={cn(
                  "aspect-square rounded flex items-center justify-center border",
                  d.completed
                    ? "bg-green-500/80 text-white border-green-600"
                    : "bg-muted/40 text-muted-foreground"
                )}
                title={`${d.date}${d.score != null ? ` score:${d.score}` : ""}`}
              >
                {label}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlayPage() {
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<TodayLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{
    days: HistoryDay[];
    streak: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/today");
        if (res.status === 401) {
          setLoading(false);
          return; // unauth, SignedOut block will handle
        }
        const data = await res.json();
        if (active) setToday(data.today);
        if (data.today) {
          // fetch streak only after played today
          const h = await fetch("/api/history");
          if (h.ok) {
            const hist = await h.json();
            if (active) setHistory(hist);
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
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Today&apos;s Game</h1>
      <SignedOut>
        <div className="text-sm text-muted-foreground">
          Please sign in to play.
        </div>
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        {loading && (
          <div className="text-sm text-muted-foreground">Loading status...</div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !today && <DynamicTodayGame />}
        {!loading && today && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Great! You already played.</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Game:</span> {today.game_type}
              </div>
              <div>
                <span className="font-medium">Score:</span> {today.score ?? "-"}
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
                <div className="italic text-muted-foreground">
                  (No reflection saved)
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {today && history && (
          <StreakCalendar days={history.days} streak={history.streak} />
        )}
      </SignedIn>
    </div>
  );
}
