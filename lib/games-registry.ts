export type GameId =
  | "match-pairs"
  | "number-maze"
  | "color-switch"
  | "math-speed"
  | "reaction-tap"
  | "sequence-memory";

export interface GameDefinition {
  id: GameId;
  name: string;
  component: () => Promise<{ default: React.ComponentType }>;
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
  {
    id: "color-switch",
    name: "Color Switch",
    component: () =>
      import("@/components/games/ColorSwitchGame").then((m) => ({
        default: m.ColorSwitchGame,
      })),
    skill: "focus",
    enabled: true,
    hint: "Tap the meaning of the word, not the ink color. 10 rounds.",
  },
  {
    id: "math-speed",
    name: "Quick Math",
    component: () =>
      import("@/components/games/QuickMathGame").then((m) => ({
        default: m.QuickMathGame,
      })),
    skill: "math",
    enabled: true,
    hint: "Solve 10 fast addition/subtraction problems.",
  },
  {
    id: "reaction-tap",
    name: "Reaction Tap",
    component: () =>
      import("@/components/games/ReactionTapGame").then((m) => ({
        default: m.ReactionTapGame,
      })),
    skill: "speed",
    enabled: true,
    hint: "Tap the highlighted square as fast as possible.",
  },
  {
    id: "sequence-memory",
    name: "Sequence Memory",
    component: () =>
      import("@/components/games/SequenceMemoryGame").then((m) => ({
        default: m.SequenceMemoryGame,
      })),
    skill: "memory",
    enabled: true,
    hint: "Memorize and reproduce a growing emoji sequence.",
  },
];

export function getTodayGame(): GameDefinition {
  // Simple deterministic rotation by date index
  const active = games.filter((g) => g.enabled);
  const index = Math.floor(Date.now() / 86_400_000) % active.length;
  return active[index];
}
