-- Additional domain tables and alterations

-- Normalize bucket list items
create table if not exists public.bucket_list_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  description text,
  category text not null,
  priority text not null default 'medium',
  completed boolean default false,
  created_at timestamptz default now(),
  target_date timestamptz,
  location text,
  estimated_cost numeric
);
create index if not exists bucket_list_items_user_idx on public.bucket_list_items (user_id);
alter table public.bucket_list_items enable row level security;
create policy if not exists "read_own_bucket_list_items" on public.bucket_list_items for select using (auth.uid() = user_id);
create policy if not exists "write_own_bucket_list_items" on public.bucket_list_items for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_bucket_list_items" on public.bucket_list_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Networking events
create table if not exists public.networking_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  date timestamptz not null,
  connections int default 0,
  xp_earned int default 0,
  type text not null, -- meetup | conference | online | coffee
  location text,
  notes text,
  contacts jsonb, -- [{ name, email?, linkedin? }]
  follow_up boolean default false,
  created_at timestamptz default now()
);
create index if not exists networking_events_user_idx on public.networking_events (user_id);
alter table public.networking_events enable row level security;
create policy if not exists "read_own_networking_events" on public.networking_events for select using (auth.uid() = user_id);
create policy if not exists "write_own_networking_events" on public.networking_events for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_networking_events" on public.networking_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public commitments
create table if not exists public.public_commitments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  description text,
  deadline timestamptz not null,
  completed boolean default false,
  xp_reward int default 0,
  is_public boolean default true,
  created_at timestamptz default now(),
  progress int default 0,
  target int default 1,
  accountability_partner text,
  notes text,
  reminders jsonb -- [{ date, sent }]
);
create index if not exists public_commitments_user_idx on public.public_commitments (user_id);
alter table public.public_commitments enable row level security;
create policy if not exists "read_own_public_commitments" on public.public_commitments for select using (auth.uid() = user_id);
create policy if not exists "write_own_public_commitments" on public.public_commitments for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_public_commitments" on public.public_commitments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Business goals
create table if not exists public.business_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  description text,
  target_date timestamptz,
  progress int default 0,
  target int default 1,
  xp_reward int default 0,
  completed boolean default false,
  category text not null, -- startup | revenue | customer | product
  created_at timestamptz default now(),
  milestones jsonb, -- [{ id, title, completed }]
  notes text,
  revenue numeric,
  customers int
);
create index if not exists business_goals_user_idx on public.business_goals (user_id);
alter table public.business_goals enable row level security;
create policy if not exists "read_own_business_goals" on public.business_goals for select using (auth.uid() = user_id);
create policy if not exists "write_own_business_goals" on public.business_goals for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_business_goals" on public.business_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Time wasters (punishments)
create table if not exists public.time_wasters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  activity text not null,
  hours numeric not null,
  xp_lost int not null,
  date timestamptz not null,
  icon text
);
create index if not exists time_wasters_user_idx on public.time_wasters (user_id);
alter table public.time_wasters enable row level security;
create policy if not exists "read_own_time_wasters" on public.time_wasters for select using (auth.uid() = user_id);
create policy if not exists "write_own_time_wasters" on public.time_wasters for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_time_wasters" on public.time_wasters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Mindfulness sessions and stats
create table if not exists public.mindfulness_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  type text not null, -- focus | calm | anxiety | morning
  duration_minutes int not null,
  mood int not null,
  date timestamptz not null default now()
);
create index if not exists mindfulness_sessions_user_idx on public.mindfulness_sessions (user_id);
alter table public.mindfulness_sessions enable row level security;
create policy if not exists "read_own_mindfulness_sessions" on public.mindfulness_sessions for select using (auth.uid() = user_id);
create policy if not exists "write_own_mindfulness_sessions" on public.mindfulness_sessions for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_mindfulness_sessions" on public.mindfulness_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.mindfulness_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  current_streak int default 0,
  total_minutes int default 0,
  average_mood int default 0,
  total_sessions int default 0,
  last_session_date timestamptz
);
alter table public.mindfulness_stats enable row level security;
create policy if not exists "read_own_mindfulness_stats" on public.mindfulness_stats for select using (auth.uid() = user_id);
create policy if not exists "write_own_mindfulness_stats" on public.mindfulness_stats for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_mindfulness_stats" on public.mindfulness_stats for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Enhance contacts with relationship metadata
alter table public.contacts
  add column if not exists relationship_score int default 50,
  add column if not exists last_contacted_at timestamptz default now(),
  add column if not exists avatar text,
  add column if not exists linkedin text,
  add column if not exists twitter text;

-- Enhance projects with more fields
alter table public.projects
  add column if not exists tech_stack text[] default '{}',
  add column if not exists image_url text,
  add column if not exists github_url text,
  add column if not exists likes int default 0,
  add column if not exists views int default 0,
  add column if not exists featured boolean default false,
  add column if not exists branch text,
  add column if not exists stars int default 0;

-- Activity log
create table if not exists public.activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  type text not null, -- task | milestone | achievement | system | life
  title text not null,
  time timestamptz not null default now(),
  icon text,
  xp int,
  metadata jsonb
);
create index if not exists activity_log_user_idx on public.activity_log (user_id);
alter table public.activity_log enable row level security;
create policy if not exists "read_own_activity_log" on public.activity_log for select using (auth.uid() = user_id);
create policy if not exists "write_own_activity_log" on public.activity_log for insert with check (auth.uid() = user_id);

-- User notifications
create table if not exists public.user_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  type text not null, -- info | achievement | warning | error | success
  title text not null,
  message text not null,
  timestamp timestamptz not null default now(),
  read boolean default false,
  priority text default 'low'
);
create index if not exists user_notifications_user_idx on public.user_notifications (user_id);
alter table public.user_notifications enable row level security;
create policy if not exists "read_own_user_notifications" on public.user_notifications for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_notifications" on public.user_notifications for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_user_notifications" on public.user_notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Fitness sessions
create table if not exists public.fitness_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  type text not null, -- cardio | strength | yoga | sport
  duration_minutes int not null,
  calories int,
  date timestamptz not null default now(),
  notes text
);
create index if not exists fitness_sessions_user_idx on public.fitness_sessions (user_id);
alter table public.fitness_sessions enable row level security;
create policy if not exists "read_own_fitness_sessions" on public.fitness_sessions for select using (auth.uid() = user_id);
create policy if not exists "write_own_fitness_sessions" on public.fitness_sessions for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_fitness_sessions" on public.fitness_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Finance transactions and savings goals
create table if not exists public.finance_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  amount numeric not null,
  type text not null, -- income | expense
  category text,
  date timestamptz not null default now(),
  notes text
);
create index if not exists finance_transactions_user_idx on public.finance_transactions (user_id);
alter table public.finance_transactions enable row level security;
create policy if not exists "read_own_finance_transactions" on public.finance_transactions for select using (auth.uid() = user_id);
create policy if not exists "write_own_finance_transactions" on public.finance_transactions for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_finance_transactions" on public.finance_transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  due_date timestamptz,
  created_at timestamptz default now(),
  notes text
);
create index if not exists savings_goals_user_idx on public.savings_goals (user_id);
alter table public.savings_goals enable row level security;
create policy if not exists "read_own_savings_goals" on public.savings_goals for select using (auth.uid() = user_id);
create policy if not exists "write_own_savings_goals" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_savings_goals" on public.savings_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Learning sessions
create table if not exists public.learning_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  topic text not null,
  duration_minutes int not null,
  date timestamptz not null default now(),
  notes text,
  resources jsonb -- [{ title, url }]
);
create index if not exists learning_sessions_user_idx on public.learning_sessions (user_id);
alter table public.learning_sessions enable row level security;
create policy if not exists "read_own_learning_sessions" on public.learning_sessions for select using (auth.uid() = user_id);
create policy if not exists "write_own_learning_sessions" on public.learning_sessions for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_learning_sessions" on public.learning_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Power-ups catalog
create table if not exists public.power_ups (
  id text primary key,
  name text not null,
  description text,
  type text not null, -- active | passive
  duration int default 0,
  cooldown int default 0,
  effects jsonb, -- [{ type, target, value, duration }]
  icon text,
  rarity text not null, -- common | rare | epic | legendary | mythic
  unlocked boolean default false,
  uses int default 0,
  max_uses int default 0,
  last_used timestamptz
);
alter table public.power_ups enable row level security;
create policy if not exists "read_power_ups" on public.power_ups for select using (true);

-- User-owned power-ups
create table if not exists public.user_power_ups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  power_up_id text not null references public.power_ups(id) on delete cascade,
  unlocked boolean default false,
  uses int default 0,
  last_used timestamptz,
  expires_at timestamptz,
  active boolean default false
);
create unique index if not exists user_power_ups_unique on public.user_power_ups (user_id, power_up_id);
alter table public.user_power_ups enable row level security;
create policy if not exists "read_own_user_power_ups" on public.user_power_ups for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_power_ups" on public.user_power_ups for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_user_power_ups" on public.user_power_ups for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Rewards shop catalog
create table if not exists public.shop_rewards (
  id text primary key,
  name text not null,
  description text,
  category text not null, -- cosmetic | powerup | title | feature | currency | boost
  rarity text not null, -- common | rare | epic | legendary | mythic
  cost int not null,
  value int,
  duration int,
  max_stack int,
  cooldown int,
  requirements jsonb, -- [{ type, value, operator }]
  effects jsonb, -- [{ type, target, value, duration }]
  icon text,
  unlocked boolean default false
);
alter table public.shop_rewards enable row level security;
create policy if not exists "read_shop_rewards" on public.shop_rewards for select using (true);

-- User shop purchases
create table if not exists public.user_shop_purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  reward_id text not null references public.shop_rewards(id) on delete cascade,
  purchased boolean default false,
  purchase_count int default 0,
  last_purchased timestamptz,
  expires_at timestamptz
);
create index if not exists user_shop_purchases_user_idx on public.user_shop_purchases (user_id);
alter table public.user_shop_purchases enable row level security;
create policy if not exists "read_own_user_shop_purchases" on public.user_shop_purchases for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_shop_purchases" on public.user_shop_purchases for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_user_shop_purchases" on public.user_shop_purchases for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Placement quests catalog
create table if not exists public.placement_quests (
  id text primary key,
  title text not null,
  description text,
  xp_reward int not null,
  time_minutes int,
  recurrence text not null, -- daily | weekly | monthly | one-off
  difficulty text not null, -- easy | medium | hard | elite | boss
  category text not null, -- technical | soft-skills | portfolio | networking | interview | application
  is_boss_quest boolean default false,
  required_streak int,
  prerequisites text[],
  bonus_xp int,
  combo_multiplier numeric,
  created_at timestamptz default now()
);
alter table public.placement_quests enable row level security;
create policy if not exists "read_placement_quests" on public.placement_quests for select using (true);

-- User quest status tracking
create table if not exists public.user_quests_status (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  quest_id text not null references public.placement_quests(id) on delete cascade,
  last_completed_at timestamptz,
  completed_count int default 0,
  streak int default 0,
  overdue boolean default false,
  penalty_applied int default 0,
  last_penalty_date timestamptz
);
create unique index if not exists user_quests_status_unique on public.user_quests_status (user_id, quest_id);
alter table public.user_quests_status enable row level security;
create policy if not exists "read_own_user_quests_status" on public.user_quests_status for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_quests_status" on public.user_quests_status for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_user_quests_status" on public.user_quests_status for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quest achievements catalog
create table if not exists public.quest_achievements (
  id text primary key,
  title text not null,
  description text,
  icon text,
  progress int default 0,
  max_progress int not null,
  created_at timestamptz default now()
);
alter table public.quest_achievements enable row level security;
create policy if not exists "read_quest_achievements" on public.quest_achievements for select using (true);

-- User quest achievements
create table if not exists public.user_quest_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  achievement_id text not null references public.quest_achievements(id) on delete cascade,
  unlocked boolean default false,
  unlocked_at timestamptz,
  progress int default 0
);
create unique index if not exists user_quest_achievements_unique on public.user_quest_achievements (user_id, achievement_id);
alter table public.user_quest_achievements enable row level security;
create policy if not exists "read_own_user_quest_achievements" on public.user_quest_achievements for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_quest_achievements" on public.user_quest_achievements for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_user_quest_achievements" on public.user_quest_achievements for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Energy system per user
create table if not exists public.user_energy (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  current int default 100,
  max int default 100,
  updated_at timestamptz default now()
);
alter table public.user_energy enable row level security;
create policy if not exists "read_own_user_energy" on public.user_energy for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_energy" on public.user_energy for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_user_energy" on public.user_energy for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seeds: sample power-ups and shop rewards
insert into public.power_ups (id, name, description, type, duration, cooldown, rarity, unlocked)
values
  ('xp_boost','XP Boost','2x XP for next quest completion','active',60,1440,'rare',true),
  ('streak_protect','Streak Shield','Protects streak for one missed day','active',1440,4320,'epic',false)
on conflict (id) do nothing;

insert into public.shop_rewards (id, name, description, category, rarity, cost, icon, unlocked)
values
  ('mystery_box','Mystery Box','Contains random reward','loot','rare',500,'🎁',true),
  ('title_master','Title: Master','Unlocks Master title','title','epic',2000,'🏆',false)
on conflict (id) do nothing;

-- Seeds: placement quests
insert into public.placement_quests (id, title, description, xp_reward, time_minutes, recurrence, difficulty, category, is_boss_quest, required_streak, prerequisites, bonus_xp, combo_multiplier)
values
  ('daily:dsa', 'Practice DSA (1h)', 'Solve algorithmic problems and sharpen your problem-solving skills', 25, 60, 'daily', 'medium', 'technical', false, null, '{}', 0, 1.0),
  ('daily:git', 'Meaningful GitHub commit', 'Make a significant contribution to any project', 10, 15, 'daily', 'easy', 'technical', false, null, '{}', 0, 1.0),
  ('daily:leetcode', 'LeetCode Challenge', 'Complete a medium/hard problem on LeetCode', 30, 45, 'daily', 'hard', 'technical', false, null, '{}', 0, 1.0),
  ('weekly:project', 'Weekly Project Milestone', 'Complete a significant milestone in your project', 120, 240, 'weekly', 'hard', 'portfolio', false, null, '{}', 0, 1.0),
  ('weekly:mock', 'Mock Interview Session', 'Complete a full mock interview with feedback', 150, 90, 'weekly', 'hard', 'interview', false, null, '{}', 0, 1.0),
  ('monthly:deploy', 'Monthly Deploy & Demo', 'Deploy a project and create a demo video', 350, 480, 'monthly', 'elite', 'portfolio', true, null, '{}', 50, 1.25)
on conflict (id) do nothing;
