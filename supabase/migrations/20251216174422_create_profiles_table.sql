/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Unique identifier for the profile
      - `user_id` (uuid, foreign key) - Links to auth.users
      - `name` (text) - User's full name
      - `email` (text) - User's email address
      - `degree` (text) - Educational degree
      - `branch` (text) - Field of study
      - `year` (integer) - Current year of study
      - `interests` (text array) - User's interests
      - `career_goal` (text) - Career aspiration
      - `avatar` (text) - Avatar image URL or emoji
      - `level` (integer) - User level in the gamification system
      - `xp` (integer) - Experience points
      - `tier` (text) - User tier (Bronze, Silver, Gold, Platinum, Mythic)
      - `streak` (integer) - Current activity streak
      - `last_activity` (timestamptz) - Last activity timestamp
      - `created_at` (timestamptz) - Profile creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to manage their own profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  degree text NOT NULL,
  branch text NOT NULL,
  year integer NOT NULL DEFAULT 1,
  interests text[] DEFAULT '{}',
  career_goal text NOT NULL,
  avatar text DEFAULT '',
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  tier text DEFAULT 'Bronze',
  streak integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);