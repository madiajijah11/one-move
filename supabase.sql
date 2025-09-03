-- Enable extensions if needed (optional)
-- create extension if not exists "uuid-ossp";

create table if not exists game_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  date date not null,
  game_type text not null,
  completed boolean default false,
  score integer,
  duration_ms integer, -- total time spent (optional)
  moves integer,      -- moves / actions count (optional)
  reflection text,
  created_at timestamptz default now(),
  unique(user_id, date, game_type)
);

-- Index to quickly fetch a user's recent logs
create index if not exists idx_game_logs_user_date on game_logs(user_id, date desc);

-- Row Level Security & Policies
alter table game_logs enable row level security;

do $$ begin
  -- Select own rows
  if not exists (
    select 1 from pg_policies where tablename='game_logs' and policyname='Select own game logs'
  ) then
    create policy "Select own game logs" on game_logs
      for select using (auth.uid()::text = user_id);
  end if;
  -- Insert own rows
  if not exists (
    select 1 from pg_policies where tablename='game_logs' and policyname='Insert own game logs'
  ) then
    create policy "Insert own game logs" on game_logs
      for insert with check (auth.uid()::text = user_id);
  end if;
  -- Update own rows
  if not exists (
    select 1 from pg_policies where tablename='game_logs' and policyname='Update own game logs'
  ) then
    create policy "Update own game logs" on game_logs
      for update using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
  end if;
end $$;

-- Weekly summaries cache table (AI summaries persisted per week)
create table if not exists weekly_summaries (
  user_id text not null,
  week_start date not null,
  summary text,
  encouragement text,
  total_games integer,
  created_at timestamptz default now(),
  primary key(user_id, week_start)
);

-- Add column if upgrading from earlier version without total_games
alter table weekly_summaries add column if not exists total_games integer;

alter table weekly_summaries enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename='weekly_summaries' and policyname='Select own weekly summaries'
  ) then
    create policy "Select own weekly summaries" on weekly_summaries for select using (auth.uid()::text = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where tablename='weekly_summaries' and policyname='Upsert own weekly summaries'
  ) then
    create policy "Upsert own weekly summaries" on weekly_summaries for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
  end if;
end $$;
