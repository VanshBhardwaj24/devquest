/*
  # Create user_app_data table for comprehensive app state persistence

  1. New Tables
    - `user_app_data`
      - Stores all app state including streaks, resets, accountability data, etc.
      - Uses JSONB for flexible schema
      - One row per user

  2. Security
    - Enable RLS
    - Users can only access their own data
*/

-- Create user_app_data table
CREATE TABLE IF NOT EXISTS user_app_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Time-based streak data
  time_based_streak jsonb DEFAULT '{
    "currentStreak": 0,
    "longestStreak": 0,
    "lastActivityDate": "",
    "streakStartDate": "",
    "dailyActivity": {}
  }'::jsonb,
  
  -- Daily reset data
  daily_reset jsonb DEFAULT '{
    "lastResetDate": "",
    "nextResetTime": null,
    "resetCountdown": 0,
    "hasResetToday": false
  }'::jsonb,
  
  -- Activity timer
  activity_timer jsonb DEFAULT '{
    "sessionStartTime": null,
    "totalActiveTime": 0,
    "currentSessionTime": 0,
    "isActive": false,
    "lastActivityTimestamp": null
  }'::jsonb,
  
  -- Accountability data
  accountability_data jsonb DEFAULT '{
    "timeWasters": [],
    "businessGoals": [],
    "internshipApplications": [],
    "networkingEvents": [],
    "publicCommitments": []
  }'::jsonb,
  
  -- Internship tracker milestones
  internship_milestones jsonb DEFAULT '[]'::jsonb,
  
  -- Non-negotiables
  non_negotiables jsonb DEFAULT '[]'::jsonb,
  
  -- Profile card stats
  profile_stats jsonb DEFAULT '{
    "lastDSASolve": null,
    "lastDSADate": null,
    "weeklyCommits": 0,
    "weeklyReset": null
  }'::jsonb,
  
  -- Integration data
  integration_data jsonb DEFAULT '{
    "github": null,
    "leetcode": null,
    "vscode": null,
    "calendar": null
  }'::jsonb,
  
  -- App preferences
  app_preferences jsonb DEFAULT '{
    "darkMode": false,
    "notifications": true
  }'::jsonb,
  
  contacts jsonb DEFAULT '[]'::jsonb,
  bucket_list jsonb DEFAULT '[]'::jsonb,
  mindfulness jsonb DEFAULT '{
    "stats": {
      "currentStreak": 0,
      "totalMinutes": 0,
      "averageMood": 0,
      "totalSessions": 0,
      "lastSessionDate": null
    },
    "sessions": []
  }'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  projects jsonb DEFAULT '[]'::jsonb,
  challenges jsonb DEFAULT '{
    "daily": [],
    "weekly": [],
    "monthly": []
  }'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_app_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own app data"
  ON user_app_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own app data"
  ON user_app_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own app data"
  ON user_app_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_app_data_user_id_idx ON user_app_data(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_app_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_app_data_updated_at
  BEFORE UPDATE ON user_app_data
  FOR EACH ROW
  EXECUTE FUNCTION update_user_app_data_updated_at();
