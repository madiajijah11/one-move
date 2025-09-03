"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { logGameCompletion } from "@/lib/game-logging";

interface Round {
  word: string;
  color: string; // actual displayed color
  answer: string; // correct answer (the text meaning)
}

const COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
];

function buildRounds(count = 10): Round[] {
  const out: Round[] = [];
  for (let i = 0; i < count; i++) {
    const text = COLORS[Math.floor(Math.random() * COLORS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    out.push({ word: text.name, color: color.hex, answer: text.name });
  }
  return out;
}

export function ColorSwitchGame() {
  const totalRounds = 10;
  const [rounds] = useState(() => buildRounds(totalRounds));
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);

  function choose(choice: string) {
    if (completed) return;
    if (choice === rounds[index].answer) setCorrect((c) => c + 1);
    const next = index + 1;
    if (next >= rounds.length) {
      setCompleted(true);
      const end = Date.now();
      setEndedAt(end);
      const duration = end - startTime;
      // Score formula: accuracy weight + speed bonus (max 100)
      const accuracy = correct + (choice === rounds[index].answer ? 1 : 0);
      const accPercent = accuracy / totalRounds; // 0..1
      const speedFactor = Math.max(0, 1 - duration / 20000); // 20s baseline
      const score = Math.round(accPercent * 70 + speedFactor * 30);
      logGameCompletion({
        gameType: "color-switch",
        score,
        duration_ms: duration,
        moves: totalRounds,
      }).catch(console.error);
    } else {
      setIndex(next);
    }
  }

  const round = rounds[index];
  const accuracyDisplay = Math.round((correct / totalRounds) * 100);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <span>Color Switch</span>
          <Hint text="Select the MEANING of the word, ignoring the ink color. 10 rounds." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!completed && (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Round {index + 1} / {totalRounds}
            </div>
            <div
              className="text-4xl font-bold text-center select-none"
              style={{ color: round.color }}
            >
              {round.word}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COLORS.map((c) => (
                <Button
                  key={c.name}
                  variant="outline"
                  className="h-14 text-lg font-semibold"
                  onClick={() => choose(c.name)}
                >
                  {c.name}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Accuracy so far: {Math.round((correct / (index || 1)) * 100) || 0}
              %
            </div>
          </div>
        )}
        {completed && (
          <div className="space-y-3 text-center">
            <div className="text-2xl font-semibold">Done! 🎉</div>
            <p className="text-sm text-muted-foreground">
              Accuracy: {accuracyDisplay}% • Time:{" "}
              {endedAt && ((endedAt - startTime) / 1000).toFixed(1)}s
            </p>
            <p className="text-xs text-muted-foreground">
              Score saved to your streak automatically.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ColorSwitchGame;
