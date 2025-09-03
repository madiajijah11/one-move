<div align="center">
	<h1>🧠 OneMove</h1>
	<p><strong>One tiny brain game a day. Build a streak. Grow a habit.</strong></p>
	<p>Play a single 60‑second puzzle, log your result, reflect briefly, and come back tomorrow. Consistency over grind.</p>
</div>

---

## ✨ What Is It?

OneMove is a minimalist daily brain‑training web app. Each day you get (or pick) a small puzzle (memory, logic, focus, math). After finishing you can jot a short reflection. A weekly AI coach summarizes your progress and encourages you.

## 🧩 Current Mini‑Games

- Match Pairs (memory)
- Number Maze (logic / path constraint)
- Color Switch (selective attention)

Planned: Math Tiles, Word Chain, more variants (goal ≈ 30 lightweight games).

## 🚀 Core Features (MVP+)

- Clerk authentication (per‑user secure data)
- Daily game logging (score, moves, duration, reflection)
- Streak + days played + per‑game aggregation
- Weekly stats + cached AI encouragement (OpenRouter via Vercel AI SDK)
- Reflection editing (inline with optimistic feedback + toasts)
- Badges (streak / activity milestones)
- Dark / Light mode (next-themes)
- Caching layer for AI summaries (prevents repeat billing & latency)
- Runtime validation guards (no external schema lib) for API payloads & AI output

## 🧱 Tech Stack

| Layer        | Choice                                             |
| ------------ | -------------------------------------------------- |
| Framework    | Next.js 15 App Router (React 19)                   |
| Auth         | Clerk                                              |
| DB / Storage | Supabase (Postgres + RLS)                          |
| Styling      | Tailwind v4 + shadcn-style primitives              |
| AI           | Vercel AI SDK + OpenRouter provider                |
| State/Theme  | next-themes, lightweight local state               |
| Validation   | Hand-written runtime guards in `lib/validation.ts` |

## 🗃️ Database Schema (Essential Tables)

```sql
-- game_logs (per user per game per day)
user_id uuid
date date
game_type text
completed boolean
score integer null
duration_ms integer null
moves integer null
reflection text null
created_at timestamptz default now()

-- weekly_summaries (cached AI output)
user_id uuid
week_start date
summary text
encouragement text
total_games integer null -- used for staleness validation
created_at timestamptz default now()
```

RLS policies restrict rows to the owning `user_id`.

## 🔐 Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...           # (server only; do NOT expose publicly)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
OPENROUTER_API_KEY=...                  # for AI summaries
OPENROUTER_MODEL=deepseek/deepseek-chat-v3.1:free  # optional override
APP_URL=http://localhost:3000           # used for Referer header
```

## 🛠️ Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

If using the service role key locally, ensure it is never exposed client‑side (only available on server functions / route handlers).

## 📊 Weekly Summary Flow

1. User plays games through the week (entries in `game_logs`).
2. Frontend requests `/api/weekly-summary`.
3. Route computes stats -> checks `weekly_summaries` for `week_start` (7‑day rolling window).
4. If cache exists AND `total_games` matches current count → return cached AI.
5. Else generate AI summary (OpenRouter) → persist row → return fresh payload.
6. Optional force refresh: `/api/weekly-summary?refresh=1`.

## 🧪 Runtime Validation

Located in `lib/validation.ts`:

- `guardLogGamePayload`
- `guardReflectionPatch`
- `guardWeeklyAI`
- `guardWeeklyStatsDTO`

These perform minimal structural checks without adding bundle weight of zod. (Future: swap to zod or valibot if complexity grows.)

## 🔌 API Endpoints (Server Routes)

| Route                 | Method | Purpose                                                      |
| --------------------- | ------ | ------------------------------------------------------------ |
| `/api/log-game`       | POST   | Upsert today’s game log (idempotent per user/date/game_type) |
| `/api/reflection`     | PATCH  | Patch reflection text for a given date                       |
| `/api/today`          | GET    | Daily status (played / streak, etc.)                         |
| `/api/history`        | GET    | Aggregated recent play history                               |
| `/api/weekly-summary` | GET    | Weekly stats + (cached) AI summary                           |

All routes require authenticated Clerk session; service role Supabase client used server-side for reliable RLS context mapping.

## 🧮 Stats & Metrics

Collected per log: `score`, `duration_ms`, `moves`, `reflection`. Weekly aggregation computes: totals, distinct game types, averages, best score, average duration/moves, reflection count.

## 🧠 AI Generation

Centralized helper: `lib/ai.ts` (OpenRouter via Vercel AI SDK). Prompt built in `lib/weekly-summary.ts`. JSON extraction fallback ensures graceful degradation if model emits extra text.

## 🛡️ Robustness Measures

- Input guards prevent malformed writes
- AI output validated before caching
- Cache invalidation tied to `total_games`
- Fail‑open strategy: if AI fails, UI still renders stats
- Service role fallback for server routes (works without per‑user Supabase session mapping)

## 🚧 Roadmap (Short List)

- Additional games (Math Tiles, Word Chain, timed variation modes)
- Badge expansion (speed, consistency tiers)
- Optional streak freeze token
- Lightweight unit tests for `computeWeeklyStats` + validators
- Rate limiting (IP + user composite) to reduce abuse
- Model fallback hierarchy (primary → cheaper backup)
- Export / share weekly progress snapshot

## 🧩 Contributing

1. Fork / branch
2. Add or modify a game inside `app/(game)/...` (follow existing pattern)
3. Ensure validators updated if new metrics added
4. Open PR with concise summary

## 🧾 License

TBD (add a license file if distributing publicly)

## 🙋 FAQ

**Why only one game a day?** Small daily wins build a sustainable habit.  
**Is AI required?** If the AI key is absent, summaries simply return stats with `hasAI=false`.  
**Can I regenerate a weekly summary?** Append `?refresh=1` to the endpoint to bypass cache.

---

Enjoy building consistent cognitive micro‑training. One move at a time.
