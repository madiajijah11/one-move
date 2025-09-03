"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Hint } from "@/components/ui/hint";
import { Button } from "@/components/ui/button";
import { logGameCompletion } from "@/lib/game-logging";

interface Cell {
  row: number;
  col: number;
  value: number;
  blocked: boolean;
  path: boolean;
}

function generateGrid(size = 5) {
  // generate numbers 1-25 shuffled
  const nums = Array.from({ length: size * size }, (_, i) => i + 1);
  // simple shuffle
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  const grid: Cell[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const value = nums[r * size + c];
      grid.push({
        row: r,
        col: c,
        value,
        blocked: value % 2 === 1,
        path: false,
      });
    }
  }
  // ensure start (0,0) and end (size-1,size-1) passable
  grid[0].blocked = false;
  grid[grid.length - 1].blocked = false;
  return grid;
}

function neighbors(cell: Cell, size: number, grid: Cell[]) {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const out: Cell[] = [];
  for (const [dr, dc] of dirs) {
    const nr = cell.row + dr,
      nc = cell.col + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      const cand = grid.find((g) => g.row === nr && g.col === nc)!;
      if (!cand.blocked) out.push(cand);
    }
  }
  return out;
}

export function NumberMazeGame() {
  const size = 5;
  const [grid, setGrid] = useState<Cell[]>(() => generateGrid(size));
  const [current, setCurrent] = useState<Cell>(() => ({
    ...generateGrid(size)[0],
    row: 0,
    col: 0,
    value: 0,
    blocked: false,
    path: true,
  }));
  const [path, setPath] = useState<Cell[]>([]);
  const [completed, setCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const startTime = useState(() => Date.now())[0];

  useEffect(() => {
    setPath([current]);
  }, []);

  function clickCell(cell: Cell) {
    if (completed) return;
    const allowed = neighbors(current, size, grid);
    if (!allowed.some((a) => a.row === cell.row && a.col === cell.col)) return;
    setCurrent(cell);
    setPath((prev) => [...prev, cell]);
    setMoves((m) => m + 1);
    if (cell.row === size - 1 && cell.col === size - 1) {
      setCompleted(true);
      const duration = Date.now() - startTime;
      const score = Math.max(100 - Math.floor(duration / 300) - moves * 2, 0);
      logGameCompletion({
        gameType: "number-maze",
        score,
        duration_ms: duration,
        moves,
      }).catch(console.error);
    }
  }

  function reset() {
    const g = generateGrid(size);
    setGrid(g);
    setCurrent({
      ...g[0],
      row: 0,
      col: 0,
      value: 0,
      blocked: false,
      path: true,
    });
    setPath([]);
    setMoves(0);
    setCompleted(false);
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2">
          <span>Number Maze</span>
          <div className="flex gap-2 items-center">
            <Hint text="Navigate to the opposite corner stepping only on even cells (odd cells are blocked)." />
            <Button variant="outline" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}
        >
          {grid.map((cell) => {
            const isCurrent =
              current.row === cell.row && current.col === cell.col;
            const isEnd = cell.row === size - 1 && cell.col === size - 1;
            return (
              <button
                key={`${cell.row}-${cell.col}`}
                disabled={cell.blocked || completed}
                onClick={() => clickCell(cell)}
                className={`h-14 text-sm border flex items-center justify-center transition relative
                  ${
                    cell.blocked
                      ? "bg-muted/30 text-muted-foreground cursor-not-allowed"
                      : "hover:bg-primary/10"
                  }
                  ${isCurrent ? "ring-2 ring-primary font-semibold" : ""}
                  ${isEnd ? "font-bold" : ""}
                `}
              >
                {cell.blocked ? "×" : cell.value}
              </button>
            );
          })}
        </div>
        <div className="mt-4 text-xs flex justify-between">
          <span>Moves: {moves}</span>
          {completed && (
            <span className="text-green-600 font-medium">Completed!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
