"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hint } from "@/components/ui/hint";
import { Button } from "@/components/ui/button";
import { logGameCompletion } from "@/lib/game-logging";

const EMOJIS = ["🍎", "⭐", "🎲", "🧠", "⚡", "🎯", "🎵", "🪄"];

export function SequenceMemoryGame() {
  const maxLen = 8;
  const [sequence] = useState<string[]>(() =>
    Array.from(
      { length: maxLen },
      () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    )
  );
  const [visibleCount, setVisibleCount] = useState(3); // current target length
  const [showPhase, setShowPhase] = useState(true);
  const [input, setInput] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (showPhase) {
      // automatically progress from reveal to input after timing
      const delay = visibleCount * 700 + 400;
      const t = setTimeout(() => setShowPhase(false), delay);
      return () => clearTimeout(t);
    }
  }, [showPhase, visibleCount]);

  function pick(e: string) {
    if (showPhase || completed || failed) return;
    const next = [...input, e];
    setInput(next);
    const target = sequence.slice(0, visibleCount);
    // Validate incrementally
    for (let i = 0; i < next.length; i++) {
      if (next[i] !== target[i]) {
        setFailed(true);
        finalize(false, i);
        return;
      }
    }
    if (next.length === visibleCount) {
      if (visibleCount === maxLen) {
        setCompleted(true);
        finalize(true, visibleCount);
      } else {
        // advance
        setVisibleCount((v) => v + 1);
        setInput([]);
        setShowPhase(true);
      }
    }
  }

  function finalize(success: boolean, lengthAchieved: number) {
    const duration = Date.now() - startTime;
    const score = success
      ? 100
      : Math.round(
          (lengthAchieved / maxLen) * 100 * 0.7 +
            Math.max(0, 1 - duration / 60000) * 30
        );
    logGameCompletion({
      gameType: "sequence-memory",
      score,
      duration_ms: duration,
      moves: lengthAchieved,
    }).catch(console.error);
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <span>Sequence Memory</span>
          <Hint text="Memorize the growing emoji sequence and reproduce it. Reaches length 8." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!completed && !failed && (
          <div className="text-center text-xs text-muted-foreground">
            Length {visibleCount} / {maxLen}{" "}
            {showPhase ? "• Memorize" : "• Your turn"}
          </div>
        )}
        <div className="flex justify-center gap-2 text-3xl">
          {Array.from({ length: visibleCount }).map((_, i) => {
            const val = sequence[i];
            const revealed = showPhase || i < input.length;
            return (
              <span
                key={i}
                className={`transition ${
                  revealed ? "opacity-100" : "opacity-0"
                }`}
              >
                {revealed ? val : "·"}
              </span>
            );
          })}
        </div>
        {!showPhase && !completed && !failed && (
          <div className="grid grid-cols-4 gap-2">
            {EMOJIS.map((e) => (
              <Button
                key={e}
                variant="outline"
                className="h-12 text-xl"
                onClick={() => pick(e)}
              >
                {e}
              </Button>
            ))}
          </div>
        )}
        {(completed || failed) && (
          <div className="space-y-2 text-center">
            <div className="text-2xl font-semibold">
              {completed ? "Perfect! 🧠" : "Stopped"}{" "}
            </div>
            <p className="text-sm text-muted-foreground">
              Reached length {failed ? input.length : maxLen}
            </p>
            <p className="text-xs text-muted-foreground">Score saved.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SequenceMemoryGame;
