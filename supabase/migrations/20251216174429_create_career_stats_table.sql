/*
  # Create career stats table

  1. New Tables
    - `career_stats`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - Links to auth.users
      - `knowledge` (integer) - Knowledge skill level (0-100)
      - `mindset` (integer) - Mindset skill level (0-100)
      - `communication` (integer) - Communication skill level (0-100)
      - `portfolio` (integer) - Portfolio quality level (0-100)
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `career_stats` table
    - Add policies for users to manage their own stats
*/

-- Create career_stats table
CREATE TABLE IF NOT EXISTS career_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  knowledge integer DEFAULT 0 CHECK (knowledge >= 0 AND knowledge <= 100),
  mindset integer DEFAULT 0 CHECK (mindset >= 0 AND mindset <= 100),
  communication integer DEFAULT 0 CHECK (communication >= 0 AND communication <= 100),
  portfolio integer DEFAULT 0 CHECK (portfolio >= 0 AND portfolio <= 100),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE career_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own career stats"
  ON career_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career stats"
  ON career_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career stats"
  ON career_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_career_stats_user_id ON career_stats(user_id);