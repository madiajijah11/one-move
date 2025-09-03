"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hint } from "@/components/ui/hint";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { logGameCompletion } from "@/lib/game-logging";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CardData {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

function generateDeck(): CardData[] {
  const symbols = ["🍎", "⭐", "🎲", "🧠", "⚡", "🎯"];
  const selected = symbols.slice(0, 6);
  const deck = [...selected, ...selected]
    .map((v, i) => ({ id: i, value: v, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

export function MatchPairsGame() {
  const [cards, setCards] = useState<CardData[]>(generateDeck);
  const [first, setFirst] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showReflect, setShowReflect] = useState(false);
  const [reflection, setReflection] = useState("");
  const [locked, setLocked] = useState(false); // mencegah klik saat evaluasi
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (matchedCount === cards.length / 2 && !completed) {
      setCompleted(true);
      setShowReflect(true);
    }
  }, [matchedCount, cards.length, moves, completed]);

  function flip(idx: number) {
    if (completed || locked) return;
    // jangan izinkan pilih kartu yang sama dua kali
    if (first === idx) return;
    // pastikan tidak klik kartu yang sudah terbuka / matched
    const target = cards.find((c) => c.id === idx);
    if (!target || target.flipped || target.matched) return;

    setCards((prev) =>
      prev.map((c) => (c.id === idx ? { ...c, flipped: true } : c))
    );

    if (first === null) {
      setFirst(idx);
      return;
    }

    // kartu kedua
    setLocked(true);
    setMoves((m) => m + 1);
    const a = cards.find((c) => c.id === first)!;
    const b = target; // nilai sudah diketahui

    if (a.value === b.value) {
      // match langsung
      setCards((prev) =>
        prev.map((c) =>
          c.value === a.value ? { ...c, matched: true, flipped: true } : c
        )
      );
      setMatchedCount((m) => m + 1);
      setFirst(null);
      setLocked(false);
    } else {
      // mismatch: sembunyikan setelah delay
      const firstIdx = first;
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstIdx || c.id === idx ? { ...c, flipped: false } : c
          )
        );
        setFirst(null);
        setLocked(false);
      }, 750);
    }
  }

  function reset() {
    setCards(generateDeck());
    setFirst(null);
    setMoves(0);
    setMatchedCount(0);
    setCompleted(false);
  }

  const progress = (matchedCount / (cards.length / 2)) * 100;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <span>Match Pairs</span>
          <div className="flex gap-2 items-center">
            <Hint text="Flip two cards, remember them. Match all pairs in as few moves as possible." />
            <Button size="sm" variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {cards.map((c) => (
            <button
              key={c.id}
              disabled={locked || c.flipped || c.matched}
              onClick={() => flip(c.id)}
              className={`h-16 rounded flex items-center justify-center text-2xl border transition relative ${
                c.matched
                  ? "bg-green-200 dark:bg-green-700"
                  : c.flipped
                  ? "bg-muted"
                  : "bg-muted/40"
              } ${locked ? "cursor-wait" : ""}`}
            >
              {c.flipped || c.matched ? c.value : "？"}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm flex justify-between">
          <span>Moves: {moves}</span>
          {completed && (
            <span className="font-medium text-green-600">Completed!</span>
          )}
        </div>
      </CardContent>
      <Dialog
        open={showReflect}
        onOpenChange={(o) => {
          if (!o) setShowReflect(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reflection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              What was tricky or what pattern did you notice?
            </p>
            <textarea
              className="w-full h-24 rounded border bg-background p-2 text-sm"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. I improved remembering positions by grouping icons"
            />
            <Button
              onClick={async () => {
                try {
                  await logGameCompletion({
                    gameType: "match-pairs",
                    score: Math.max(100 - moves * 5, 0),
                    reflection,
                    moves,
                    // approximate duration: derive from DOM timestamp stored when component mounted
                    duration_ms: startTime ? Date.now() - startTime : undefined,
                  });
                } catch (e) {
                  console.error(e);
                } finally {
                  setShowReflect(false);
                }
              }}
              disabled={!reflection.trim()}
            >
              Save Reflection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
