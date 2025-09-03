export interface Badge {
  id: string;
  label: string;
  threshold: number; // streak length required
}

export const BADGES: Badge[] = [
  { id: "streak-3", label: "3-Day Spark", threshold: 3 },
  { id: "streak-7", label: "1 Week Focus", threshold: 7 },
  { id: "streak-14", label: "2 Week Groove", threshold: 14 },
  { id: "streak-30", label: "30-Day Momentum", threshold: 30 },
  { id: "streak-50", label: "50-Day Discipline", threshold: 50 },
  { id: "streak-100", label: "Century Brain", threshold: 100 },
];

export function earnedBadges(streak: number): Badge[] {
  return BADGES.filter((b) => streak >= b.threshold);
}
