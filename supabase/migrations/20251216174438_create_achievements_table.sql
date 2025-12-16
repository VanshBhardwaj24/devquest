/*
  # Create achievements and user_achievements tables

  1. New Tables
    - `achievements`
      - `id` (text, primary key) - Unique achievement identifier
      - `title` (text) - Achievement title
      - `description` (text) - Achievement description
      - `icon` (text) - Achievement icon/emoji
      - `tier` (text) - Achievement tier (bronze, silver, gold, platinum, mythic)
      - `xp` (integer) - XP reward for unlocking
      - `created_at` (timestamptz) - Creation timestamp
    
    - `user_achievements`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - Links to auth.users
      - `achievement_id` (text, foreign key) - Links to achievements
      - `unlocked_at` (timestamptz) - Unlock timestamp

  2. Security
    - Enable RLS on both tables
    - All users can view achievements (public)
    - Users can only manage their own achievement unlocks
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  tier text NOT NULL,
  xp integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Insert default achievements
INSERT INTO achievements (id, title, description, icon, tier, xp) VALUES
  ('profile-complete', 'Profile Complete', 'Complete your career profile', '✨', 'bronze', 100),
  ('first-task', 'First Task', 'Complete your first task', '🎯', 'bronze', 50),
  ('task-master', 'Task Master', 'Complete 10 tasks', '🏆', 'silver', 200),
  ('coding-starter', 'Coding Starter', 'Solve your first coding problem', '💻', 'bronze', 75),
  ('coding-pro', 'Coding Pro', 'Solve 50 coding problems', '🚀', 'gold', 500)
ON CONFLICT (id) DO NOTHING;