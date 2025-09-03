export type GameId = "match-pairs" | "number-maze";

export interface GameDefinition {
  id: GameId;
  name: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  skill: string;
  enabled: boolean;
  hint: string;
}

export const games: GameDefinition[] = [
  {
    id: "match-pairs",
    name: "Match Pairs",
    component: () =>
      import("@/components/games/MatchPairsGame").then((m) => ({
        default: m.MatchPairsGame,
      })),
    skill: "memory",
    enabled: true,
    hint: "Flip two cards. Remember positions. Match all pairs in the fewest moves.",
  },
  {
    id: "number-maze",
    name: "Number Maze",
    component: () =>
      import("@/components/games/NumberMazeGame").then((m) => ({
        default: m.NumberMazeGame,
      })),
    skill: "logic",
    enabled: true,
    hint: "Move from start to finish stepping only on even cells.",
  },
];

export function getTodayGame(): GameDefinition {
  // Simple deterministic rotation by date index
  const active = games.filter((g) => g.enabled);
  const index = Math.floor(Date.now() / 86_400_000) % active.length;
  return active[index];
}
