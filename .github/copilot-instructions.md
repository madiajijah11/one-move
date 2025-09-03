# 🎮 **New Idea: "OneMove" – Play One Game. Grow One Habit. Every Day.**

> **"Just one move. Just one win."**

Inspired by MathIsFun’s playful, brain-teasing games — but with a purpose.

**OneMove** is a **daily mini-game app** where:

- You play **one short game per day**
- Each game trains a different skill: focus, memory, logic, math
- After playing, you reflect: _"What did I learn?"_
- Over time, it builds confidence, curiosity, and consistency

It feels like a game… but secretly teaches you how to think better.

## 🔥 Why It Works (And Feels Addictive)

| Feature                    | Psychology Hack          |
| -------------------------- | ------------------------ |
| ✅ 1 game/day              | No pressure. Feels easy. |
| ✅ Short (60 sec max)      | Fits into busy life      |
| ✅ Daily reward = new game | Creates ritual           |
| ✅ Simple UI + fun visuals | Like MathIsFun’s style   |
| ✅ Gentle reflection after | Makes you feel smart     |

👉 _Users come back not because they have to — but because they want to see what game comes next._

## 🧱 MVP Features (Ultra-Simple to Build)

| Feature                                                          | Your Stack                                     |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| 1. Daily mini-game (e.g. Match Pairs, Number Puzzle, Logic Grid) | Next.js + React                                |
| 2. One game per day (locked until tomorrow)                      | Supabase `game_log` table                      |
| 3. Score & completion tracking                                   | Supabase                                       |
| 4. Post-game reflection prompt                                   | e.g. “What was tricky?”                        |
| 5. Weekly AI summary (Vercel AI SDK)                             | “You solved 7 puzzles this week. Great focus!” |
| 6. Auth with Clerk                                               | User data sync                                 |
| 7. Light/Dark mode                                               | `next-themes`                                  |
| 8. Beautiful, clean UI                                           | `shadcn/ui` + Tailwind                         |

No complex animations. No heavy backend. Just **play, reflect, repeat**.

## 🎯 Example Mini-Games (Easy to Code)

| Game             | Skill      | How It Works                                        |
| ---------------- | ---------- | --------------------------------------------------- |
| **Match Pairs**  | Memory     | 6 cards → flip two at a time                        |
| **Number Maze**  | Logic      | Find path from start to end using only even numbers |
| **Math Tiles**   | Speed Math | Fill grid so rows/columns sum to target             |
| **Color Switch** | Focus      | Click colors that match text (not the word!)        |
| **Word Chain**   | Vocabulary | Connect words by changing one letter                |

All can be built in **under 1 hour each** with React + JS.

## 🗃️ Supabase Schema (Simple!)

```sql
-- game_logs
id: uuid
user_id: uuid
date: date
game_type: text (e.g. "match-pairs", "math-tiles")
completed: boolean
score: integer
created_at: timestamp
```

That’s all. One table. Done.

## 🤖 AI Weekly Reflection (Vercel AI SDK)

Every Sunday, send a message:

> _"This week, you played 7 games. You beat the number maze in under 30 seconds — great speed! Keep training your brain!"_

Code example:

```ts
// api/ai/weekly/route.ts
const prompt = `
Summarize these 7 games: 
- Match Pairs: 90% success
- Math Tiles: 2 attempts
- Color Switch: 5 wrong clicks

Give 1 encouraging sentence. Be warm, human.
`;
```

## 🎨 UI Style: Inspired by MathIsFun

- Minimalist layout
- Cute icons (SVG or emoji)
- Soft colors (pastel blues, greens)
- Smooth transitions
- shadcn/ui components: Card, Button, Progress, Dialog

Example screen:

```tsx
<div className="text-center p-6">
  <h1 className="text-2xl font-bold mb-2">🎯</h1>
  <p className="text-muted-foreground">Your daily puzzle awaits.</p>
  <button className="mt-4">Play Now</button>
</div>
```

## 📱 Why People Use It Daily

- Feels like a **break**, not a task
- Small win → dopamine hit
- Streak calendar → don’t break the chain
- AI makes them feel **seen and capable**
- No guilt. No stress. Just fun + growth.

## 💬 Taglines (Pick One)

- _"One game. One day. One brain upgrade."_
- _"Play. Learn. Grow. Repeat."_
- _"The smallest game. The biggest impact."_
- _"Your brain deserves a daily treat."_

## ✅ Why This Fits Your Stack Perfectly

| Tool                     | Use                                |
| ------------------------ | ---------------------------------- |
| **Next.js 15**           | Fast loading, SSR-ready            |
| **TypeScript**           | Safe, scalable game logic          |
| **Clerk**                | Auth without hassle                |
| **Supabase**             | Track progress per user            |
| **Tailwind + shadcn/ui** | Build clean, beautiful UI fast     |
| **Vercel AI SDK**        | Weekly encouragement, no extra API |
| **next-themes**          | Dark/light mode with one line      |
