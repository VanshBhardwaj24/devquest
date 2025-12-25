/*
  # Create coding-related tables

  1. New Tables
    - `coding_problems`
      - `id` (text, primary key) - Unique problem identifier
      - `title` (text) - Problem title
      - `description` (text) - Problem description
      - `difficulty` (text) - Problem difficulty (Easy, Medium, Hard)
      - `platform` (text) - Platform name (LeetCode, GeeksforGeeks, CodeChef)
      - `url` (text) - Problem URL
      - `tags` (text array) - Problem tags/topics
      - `xp` (integer) - XP reward for solving
      - `created_at` (timestamptz) - Creation timestamp
    
    - `coding_streaks`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - Links to auth.users
      - `current_streak` (integer) - Current consecutive days
      - `longest_streak` (integer) - Longest streak achieved
      - `last_solved_date` (date) - Last problem solved date
      - `total_problems_solved` (integer) - Total problems solved
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - coding_problems are public (read-only)
    - Users can only manage their own streaks
*/

-- Create coding_problems table
CREATE TABLE IF NOT EXISTS coding_problems (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  difficulty text NOT NULL,
  platform text NOT NULL,
  url text NOT NULL,
  tags text[] DEFAULT '{}',
  xp integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create coding_streaks table
CREATE TABLE IF NOT EXISTS coding_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_solved_date date DEFAULT NULL,
  total_problems_solved integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_streaks ENABLE ROW LEVEL SECURITY;

-- Policies for coding_problems (public read)
CREATE POLICY "Anyone can view coding problems"
  ON coding_problems FOR SELECT
  TO authenticated
  USING (true);

-- Policies for coding_streaks
CREATE POLICY "Users can view own coding streak"
  ON coding_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coding streak"
  ON coding_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coding streak"
  ON coding_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coding_streaks_user_id ON coding_streaks(user_id);