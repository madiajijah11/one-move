"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hint } from "@/components/ui/hint";
import { Button } from "@/components/ui/button";
import { logGameCompletion } from "@/lib/game-logging";

interface Problem {
  a: number;
  b: number;
  op: string;
  answer: number;
  choices: number[];
}

function makeProblem(): Problem {
  const a = Math.floor(Math.random() * 19) + 1;
  const b = Math.floor(Math.random() * 19) + 1;
  const op = Math.random() < 0.5 ? "+" : "-";
  const answer = op === "+" ? a + b : a - b;
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const delta = Math.floor(Math.random() * 7) - 3;
    const c = answer + delta;
    if (c !== answer) choices.add(c);
  }
  return {
    a,
    b,
    op,
    answer,
    choices: Array.from(choices).sort(() => Math.random() - 0.5),
  };
}

export function QuickMathGame() {
  const total = 10;
  const [problems] = useState(() => Array.from({ length: total }, makeProblem));
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);

  function pick(choice: number) {
    if (completed) return;
    const p = problems[index];
    if (choice === p.answer) setCorrect((c) => c + 1);
    const next = index + 1;
    if (next >= total) {
      setCompleted(true);
      const end = Date.now();
      setEndedAt(end);
      const duration = end - startTime; // ms
      const acc = (correct + (choice === p.answer ? 1 : 0)) / total; // 0..1
      const speedFactor = Math.max(0, 1 - duration / 30000); // 30s baseline
      const score = Math.round(acc * 70 + speedFactor * 30);
      logGameCompletion({
        gameType: "math-speed",
        score,
        duration_ms: duration,
        moves: total,
      }).catch(console.error);
    } else {
      setIndex(next);
    }
  }

  const p = problems[index];
  const accuracyDisplay = Math.round(
    (correct / (completed ? total : Math.max(1, index))) * 100
  );

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <span>Quick Math</span>
          <Hint text="Answer 10 quick addition/subtraction problems. Accuracy + speed = score." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!completed && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              Problem {index + 1} / {total}
            </div>
            <div className="text-center text-4xl font-bold select-none">
              {p.a} {p.op} {p.b} = ?
            </div>
            <div className="grid grid-cols-2 gap-2">
              {p.choices.map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  className="h-16 text-xl"
                  onClick={() => pick(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Accuracy: {accuracyDisplay}%
            </div>
          </div>
        )}
        {completed && (
          <div className="space-y-2 text-center">
            <div className="text-2xl font-semibold">Done! ✅</div>
            <p className="text-sm text-muted-foreground">
              Accuracy: {Math.round((correct / total) * 100)}% • Time:{" "}
              {endedAt && ((endedAt - startTime) / 1000).toFixed(1)}s
            </p>
            <p className="text-xs text-muted-foreground">Score saved.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QuickMathGame;
