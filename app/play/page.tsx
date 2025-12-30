"use client";
import { useEffect, useState, useMemo, Suspense, lazy } from "react";
import { getTodayGame } from "@/lib/games-registry";

// Lazy wrapper factory to avoid reevaluating component each render
function useLazyTodayComponent(
  gameId: string,
  loader: () => Promise<{ default: React.ComponentType }>
) {
  return useMemo(() => lazy(loader), [loader]);
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
  duration_ms?: number | null;
  moves?: number | null;
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
  const gameDef = useMemo(() => getTodayGame(), []);
  const LazyComp = useLazyTodayComponent(gameDef.id, gameDef.component);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<TodayLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{
    days: HistoryDay[];
    streak: number;
  } | null>(null);
  const [editingReflection, setEditingReflection] = useState(false);
  const [reflectionDraft, setReflectionDraft] = useState("");

  useEffect(() => {
    let active = true;
    async function loadStatus() {
      try {
        setLoading(true);
        const res = await fetch("/api/today");
        if (res.status === 401) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!active) return;
        setToday(data.today);
        if (data.today?.reflection) setReflectionDraft(data.today.reflection);
        if (data.today) {
          const h = await fetch("/api/history");
          if (h.ok) {
            const hist = await h.json();
            if (active) setHistory(hist);
          }
        }
      } catch (e: unknown) {
        if (active) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStatus();

    function onLogged() {
      // After a game logs, refresh the status so UI switches to summary
      loadStatus();
    }
    window.addEventListener("game-logged", onLogged as EventListener);
    return () => {
      active = false;
      window.removeEventListener("game-logged", onLogged as EventListener);
    };
  }, []);

  return (
    <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold">Today&apos;s Game</h1>
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
        {!loading && !today && (
          <div className="space-y-4">
            <div className="p-3 rounded border bg-muted/30 text-xs flex justify-between items-center gap-4">
              <div className="space-y-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {gameDef.name}
                </div>
                <p className="text-muted-foreground max-w-md leading-snug text-[11px] sm:text-xs">
                  {gameDef.hint}
                </p>
              </div>
              <span className="flex-shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                {gameDef.skill}
              </span>
            </div>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Loading game...
                </div>
              }
            >
              <LazyComp />
            </Suspense>
          </div>
        )}
        {!loading && today && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Great! You already played {gameDef.name}.</span>
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
              <div className="flex gap-4 text-xs text-muted-foreground">
                {today.moves != null && <span>Moves: {today.moves}</span>}
                {today.duration_ms != null && (
                  <span>Time: {(today.duration_ms / 1000).toFixed(1)}s</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground border rounded p-2 bg-muted/30">
                <span className="font-medium">Hint:</span> {gameDef.hint}
              </div>
              {today.reflection && (
                <div>
                  <span className="font-medium">Reflection:</span>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {today.reflection}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setEditingReflection(true);
                      setReflectionDraft(today.reflection || "");
                    }}
                  >
                    Edit Reflection
                  </Button>
                </div>
              )}
              {!today.reflection && (
                <div className="italic text-muted-foreground">
                  (No reflection saved)
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingReflection(true)}
                    >
                      Add Reflection
                    </Button>
                  </div>
                </div>
              )}
              {editingReflection && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={reflectionDraft}
                    onChange={(e) => setReflectionDraft(e.target.value)}
                    className="w-full h-28 text-xs rounded border bg-background p-2"
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        const date = new Date().toISOString().slice(0, 10);
                        const res = await fetch("/api/reflection", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            date,
                            reflection: reflectionDraft,
                          }),
                        });
                        if (res.ok) {
                          setToday((t) =>
                            t ? { ...t, reflection: reflectionDraft } : t
                          );
                          setEditingReflection(false);
                        }
                      }}
                      disabled={!reflectionDraft.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingReflection(false)}
                    >
                      Cancel
                    </Button>
                  </div>
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
