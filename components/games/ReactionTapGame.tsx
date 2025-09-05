"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hint } from "@/components/ui/hint";
import { Button } from "@/components/ui/button";
import { logGameCompletion } from "@/lib/game-logging";

const GRID = 9; // 3x3

export function ReactionTapGame() {
  const rounds = 7;
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const appearAt = useRef<number | null>(null);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (completed) return;
    scheduleNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  function scheduleNext() {
    if (round >= rounds) return;
    setWaiting(true);
    const delay = 500 + Math.random() * 1200;
    setTimeout(() => {
      if (round >= rounds) return;
      setCurrentIndex(Math.floor(Math.random() * GRID));
      appearAt.current = performance.now();
      setWaiting(false);
    }, delay);
  }

  function click(i: number) {
    if (completed || currentIndex == null) return;
    if (i !== currentIndex) return; // ignore wrong
    const now = performance.now();
    if (appearAt.current) {
      const delta = now - appearAt.current;
      setTimes((t) => [...t, delta]);
    }
    const nextRound = round + 1;
    setCurrentIndex(null);
    setRound(nextRound);
    if (nextRound >= rounds) {
      const avg =
        (times.reduce((a, b) => a + b, 0) +
          (appearAt.current ? performance.now() - appearAt.current : 0)) /
        (times.length + 1);
      const duration = Date.now() - startTime;
      const score = Math.max(0, 100 - Math.round(avg / 10)); // each 10ms over baseline reduces score
      logGameCompletion({
        gameType: "reaction-tap",
        score,
        duration_ms: duration,
        moves: rounds,
      }).catch(console.error);
      setCompleted(true);
    }
  }

  const avg = times.length
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : null;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <span>Reaction Tap</span>
          <Hint text="Tap the highlighted square as fast as you can. 7 rounds. Score = faster average reaction." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!completed && (
          <div className="text-center text-xs text-muted-foreground">
            Round {Math.min(round + 1, rounds)} / {rounds}
            {waiting ? " • waiting..." : ""}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: GRID }).map((_, i) => (
            <button
              key={i}
              onClick={() => click(i)}
              aria-label={currentIndex === i ? "Active target" : "Cell"}
              className={`h-20 rounded border transition relative overflow-hidden ${
                currentIndex === i
                  ? "bg-primary text-primary-foreground scale-105"
                  : "bg-muted/40 hover:bg-muted"
              }`}
            >
              <span className="sr-only">
                {currentIndex === i ? "Tap now" : "Cell"}
              </span>
            </button>
          ))}
        </div>
        {!completed && avg != null && (
          <div className="text-center text-xs text-muted-foreground">
            Avg: {avg} ms
          </div>
        )}
        {completed && (
          <div className="space-y-2 text-center">
            <div className="text-2xl font-semibold">Done ⚡</div>
            <p className="text-sm text-muted-foreground">
              Average reaction: {avg} ms
            </p>
            <p className="text-xs text-muted-foreground">Score saved.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReactionTapGame;
