create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  name text not null,
  email text not null,
  degree text not null,
  branch text not null,
  year int not null,
  interests text[] default '{}',
  avatar text default '',
  level int default 1,
  xp int default 0,
  tier text default 'bronze',
  streak int default 0,
  career_goal text default '',
  last_activity timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  description text,
  priority text not null,
  category text not null,
  completed boolean default false,
  xp int default 0,
  streak int default 0,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists tasks_user_id_idx on public.tasks (user_id);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null,
  tier text not null,
  xp int not null,
  created_at timestamptz default now()
);

create table if not exists public.user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  achievement_id text not null references public.achievements(id),
  unlocked_at timestamptz default now()
);
create unique index if not exists user_achievements_unique on public.user_achievements (user_id, achievement_id);

create table if not exists public.career_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  knowledge int default 0,
  mindset int default 0,
  communication int default 0,
  portfolio int default 0,
  updated_at timestamptz default now()
);

create table if not exists public.coding_problems (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  difficulty text not null,
  platform text not null,
  url text not null,
  tags text[] default '{}',
  xp int default 50,
  created_at timestamptz default now()
);

create table if not exists public.problem_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  problem_id uuid not null references public.coding_problems(id) on delete cascade,
  solved boolean not null,
  time_spent int,
  solution_code text,
  language text,
  submitted_at timestamptz not null default now()
);
create unique index if not exists problem_submissions_unique on public.problem_submissions (user_id, problem_id);
create index if not exists problem_submissions_user_idx on public.problem_submissions (user_id);

create table if not exists public.coding_streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  current_streak int default 0,
  longest_streak int default 0,
  total_problems_solved int default 0,
  last_solved_date date,
  updated_at timestamptz default now()
);

create table if not exists public.daily_challenges (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  problem_id uuid not null references public.coding_problems(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.user_app_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  time_based_streak jsonb,
  daily_reset jsonb,
  activity_timer jsonb,
  accountability_data jsonb,
  internship_milestones jsonb,
  non_negotiables jsonb,
  profile_stats jsonb,
  integration_data jsonb,
  app_preferences jsonb,
  contacts jsonb,
  bucket_list jsonb,
  mindfulness jsonb,
  projects jsonb,
  skills jsonb,
  challenges jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.internship_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  company text not null,
  role text not null,
  status text not null default 'Applied',
  location text,
  salary text,
  link text,
  notes text,
  date_applied timestamptz not null default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists internship_applications_user_idx on public.internship_applications (user_id);

create table if not exists public.internship_tags (
  id uuid default gen_random_uuid() primary key,
  application_id uuid not null references public.internship_applications(id) on delete cascade,
  tag text not null
);
create index if not exists internship_tags_app_idx on public.internship_tags (application_id);

create table if not exists public.internship_interviews (
  id uuid default gen_random_uuid() primary key,
  application_id uuid not null references public.internship_applications(id) on delete cascade,
  date_iso timestamptz not null,
  type text not null,
  notes text
);
create index if not exists internship_interviews_app_idx on public.internship_interviews (application_id);

create table if not exists public.internship_checklist (
  id uuid default gen_random_uuid() primary key,
  application_id uuid not null references public.internship_applications(id) on delete cascade,
  title text not null,
  done boolean default false
);
create index if not exists internship_checklist_app_idx on public.internship_checklist (application_id);

create table if not exists public.internship_reminders (
  id uuid default gen_random_uuid() primary key,
  application_id uuid not null references public.internship_applications(id) on delete cascade,
  title text not null,
  due_iso timestamptz not null
);
create index if not exists internship_reminders_app_idx on public.internship_reminders (application_id);

create table if not exists public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  email text,
  phone text,
  company text,
  role text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists contacts_user_idx on public.contacts (user_id);

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  description text,
  status text default 'Active',
  repo_url text,
  live_url text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists projects_user_idx on public.projects (user_id);

create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  category text not null,
  level int default 1,
  xp int default 0,
  practice_log jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists skills_user_idx on public.skills (user_id);

create table if not exists public.challenges_daily (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  completed boolean default false,
  xp int default 0,
  date date not null default now()
);
create index if not exists challenges_daily_user_idx on public.challenges_daily (user_id);

create table if not exists public.challenges_weekly (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  completed boolean default false,
  xp int default 0,
  week int not null,
  year int not null
);
create unique index if not exists challenges_weekly_unique on public.challenges_weekly (user_id, week, year, title);

create table if not exists public.challenges_monthly (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  completed boolean default false,
  xp int default 0,
  month int not null,
  year int not null
);
create unique index if not exists challenges_monthly_unique on public.challenges_monthly (user_id, month, year, title);

insert into public.achievements (id, title, description, icon, tier, xp)
values
  ('profile-complete','Profile Pioneer','Complete your profile setup','👤','bronze',100)
on conflict (id) do nothing;

insert into public.coding_problems (id, title, difficulty, platform, url, tags, xp)
values
  (gen_random_uuid(),'Two Sum','Easy','LeetCode','https://leetcode.com/problems/two-sum','{array,hashmap}',50)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.user_achievements enable row level security;
alter table public.career_stats enable row level security;
alter table public.coding_problems enable row level security;
alter table public.problem_submissions enable row level security;
alter table public.coding_streaks enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.user_app_data enable row level security;
alter table public.internship_applications enable row level security;
alter table public.internship_tags enable row level security;
alter table public.internship_interviews enable row level security;
alter table public.internship_checklist enable row level security;
alter table public.internship_reminders enable row level security;
alter table public.contacts enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.challenges_daily enable row level security;
alter table public.challenges_weekly enable row level security;
alter table public.challenges_monthly enable row level security;

create policy if not exists "read_own_profiles" on public.profiles
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_profiles" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_profiles" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_tasks" on public.tasks
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_tasks" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_achievements" on public.achievements
  for select using (true);

create policy if not exists "read_own_user_achievements" on public.user_achievements
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_achievements" on public.user_achievements
  for insert with check (auth.uid() = user_id);

create policy if not exists "read_own_career_stats" on public.career_stats
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_career_stats" on public.career_stats
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_career_stats" on public.career_stats
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_coding_problems" on public.coding_problems
  for select using (true);

create policy if not exists "read_own_problem_submissions" on public.problem_submissions
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_problem_submissions" on public.problem_submissions
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_problem_submissions" on public.problem_submissions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_daily_challenges" on public.daily_challenges
  for select using (true);

create policy if not exists "read_own_coding_streaks" on public.coding_streaks
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_coding_streaks" on public.coding_streaks
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_coding_streaks" on public.coding_streaks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_user_app_data" on public.user_app_data
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_user_app_data" on public.user_app_data
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_user_app_data" on public.user_app_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_internship_applications" on public.internship_applications
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_internship_applications" on public.internship_applications
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_internship_applications" on public.internship_applications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_contacts" on public.contacts
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_contacts" on public.contacts
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_contacts" on public.contacts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_projects" on public.projects
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_projects" on public.projects
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_projects" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_skills" on public.skills
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_skills" on public.skills
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_skills" on public.skills
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_challenges_daily" on public.challenges_daily
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_challenges_daily" on public.challenges_daily
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_challenges_daily" on public.challenges_daily
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_challenges_weekly" on public.challenges_weekly
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_challenges_weekly" on public.challenges_weekly
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_challenges_weekly" on public.challenges_weekly
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "read_own_challenges_monthly" on public.challenges_monthly
  for select using (auth.uid() = user_id);
create policy if not exists "write_own_challenges_monthly" on public.challenges_monthly
  for insert with check (auth.uid() = user_id);
create policy if not exists "update_own_challenges_monthly" on public.challenges_monthly
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
