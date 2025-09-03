"use client";
import { games, getTodayGame } from "@/lib/games-registry";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";

export default function GamesCatalogPage() {
  const today = getTodayGame();
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Games Library</h1>
        <p className="text-sm text-muted-foreground">
          Explore all available daily mini‑games. Only one is playable per day.
        </p>
      </header>
      <div className="grid sm:grid-cols-2 gap-4">
        {games
          .filter((g) => g.enabled)
          .map((g) => {
            const isToday = g.id === today.id;
            return (
              <Card key={g.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center gap-2">
                    <span>{g.name}</span>
                    {isToday && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground">
                        Today
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="uppercase tracking-wide text-[10px] font-medium">
                      {g.skill}
                    </span>
                    <Hint text={g.hint} />
                  </div>
                  <p className="leading-snug text-muted-foreground/80 line-clamp-3">
                    {g.hint}
                  </p>
                  <div className="mt-auto pt-2">
                    {isToday ? (
                      <Button asChild size="sm" className="w-full">
                        <Link href="/play">Play Today&apos;s Game</Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        <span>Locked Until Rotation</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
