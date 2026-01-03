export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          tier: string
          title: string
          xp: number
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id: string
          tier: string
          title: string
          xp: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          tier?: string
          title?: string
          xp?: number
        }
        Relationships: []
      }
      bucket_list_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          priority: string
          completed: boolean
          created_at: string
          target_date: string | null
          location: string | null
          estimated_cost: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          priority?: string
          completed?: boolean
          created_at?: string
          target_date?: string | null
          location?: string | null
          estimated_cost?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          priority?: string
          completed?: boolean
          created_at?: string
          target_date?: string | null
          location?: string | null
          estimated_cost?: number | null
        }
        Relationships: []
      }
      networking_events: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          connections: number
          xp_earned: number
          type: string
          location: string | null
          notes: string | null
          contacts: Json | null
          follow_up: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date: string
          connections?: number
          xp_earned?: number
          type: string
          location?: string | null
          notes?: string | null
          contacts?: Json | null
          follow_up?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          connections?: number
          xp_earned?: number
          type?: string
          location?: string | null
          notes?: string | null
          contacts?: Json | null
          follow_up?: boolean
          created_at?: string
        }
        Relationships: []
      }
      public_commitments: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          deadline: string
          completed: boolean
          xp_reward: number
          is_public: boolean
          created_at: string
          progress: number
          target: number
          accountability_partner: string | null
          notes: string | null
          reminders: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          deadline: string
          completed?: boolean
          xp_reward?: number
          is_public?: boolean
          created_at?: string
          progress?: number
          target?: number
          accountability_partner?: string | null
          notes?: string | null
          reminders?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          deadline?: string
          completed?: boolean
          xp_reward?: number
          is_public?: boolean
          created_at?: string
          progress?: number
          target?: number
          accountability_partner?: string | null
          notes?: string | null
          reminders?: Json | null
        }
        Relationships: []
      }
      business_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_date: string | null
          progress: number
          target: number
          xp_reward: number
          completed: boolean
          category: string
          created_at: string
          milestones: Json | null
          notes: string | null
          revenue: number | null
          customers: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_date?: string | null
          progress?: number
          target?: number
          xp_reward?: number
          completed?: boolean
          category: string
          created_at?: string
          milestones?: Json | null
          notes?: string | null
          revenue?: number | null
          customers?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          progress?: number
          target?: number
          xp_reward?: number
          completed?: boolean
          category?: string
          created_at?: string
          milestones?: Json | null
          notes?: string | null
          revenue?: number | null
          customers?: number | null
        }
        Relationships: []
      }
      time_wasters: {
        Row: {
          id: string
          user_id: string
          activity: string
          hours: number
          xp_lost: number
          date: string
          icon: string | null
        }
        Insert: {
          id?: string
          user_id: string
          activity: string
          hours: number
          xp_lost: number
          date: string
          icon?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          activity?: string
          hours?: number
          xp_lost?: number
          date?: string
          icon?: string | null
        }
        Relationships: []
      }
      mindfulness_sessions: {
        Row: {
          id: string
          user_id: string
          type: string
          duration_minutes: number
          mood: number
          date: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          duration_minutes: number
          mood: number
          date?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          duration_minutes?: number
          mood?: number
          date?: string
        }
        Relationships: []
      }
      mindfulness_stats: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          total_minutes: number
          average_mood: number
          total_sessions: number
          last_session_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          total_minutes?: number
          average_mood?: number
          total_sessions?: number
          last_session_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          total_minutes?: number
          average_mood?: number
          total_sessions?: number
          last_session_date?: string | null
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          time: string
          icon: string | null
          xp: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          time?: string
          icon?: string | null
          xp?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          time?: string
          icon?: string | null
          xp?: number | null
          metadata?: Json | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          timestamp: string
          read: boolean
          priority: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          timestamp?: string
          read?: boolean
          priority?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          timestamp?: string
          read?: boolean
          priority?: string
        }
        Relationships: []
      }
      fitness_sessions: {
        Row: {
          id: string
          user_id: string
          type: string
          duration_minutes: number
          calories: number | null
          date: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          duration_minutes: number
          calories?: number | null
          date?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          duration_minutes?: number
          calories?: number | null
          date?: string
          notes?: string | null
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          category: string | null
          date: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          category?: string | null
          date?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          category?: string | null
          date?: string
          notes?: string | null
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number
          current_amount: number
          due_date: string | null
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          current_amount?: number
          due_date?: string | null
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          current_amount?: number
          due_date?: string | null
          created_at?: string
          notes?: string | null
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          id: string
          user_id: string
          topic: string
          duration_minutes: number
          date: string
          notes: string | null
          resources: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          duration_minutes: number
          date?: string
          notes?: string | null
          resources?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          duration_minutes?: number
          date?: string
          notes?: string | null
          resources?: Json | null
        }
        Relationships: []
      }
      career_stats: {
        Row: {
          communication: number
          id: string
          knowledge: number
          mindset: number
          portfolio: number
          updated_at: string
          user_id: string
        }
        Insert: {
          communication?: number
          id?: string
          knowledge?: number
          mindset?: number
          portfolio?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          communication?: number
          id?: string
          knowledge?: number
          mindset?: number
          portfolio?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      coding_problems: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          id: string
          platform: string
          tags: string[]
          title: string
          url: string
          xp: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty: string
          id: string
          platform: string
          tags?: string[]
          title: string
          url: string
          xp?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          platform?: string
          tags?: string[]
          title?: string
          url?: string
          xp?: number
        }
        Relationships: []
      }
      coding_streaks: {
        Row: {
          current_streak: number
          id: string
          last_solved_date: string | null
          longest_streak: number
          total_problems_solved: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_solved_date?: string | null
          longest_streak?: number
          total_problems_solved?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_solved_date?: string | null
          longest_streak?: number
          total_problems_solved?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar: string
          branch: string
          career_goal: string
          created_at: string
          degree: string
          email: string
          id: string
          interests: string[]
          last_activity: string
          level: number
          name: string
          streak: number
          tier: string
          updated_at: string
          user_id: string
          xp: number
          year: number
        }
        Insert: {
          avatar?: string
          branch: string
          career_goal: string
          created_at?: string
          degree: string
          email: string
          id?: string
          interests?: string[]
          last_activity?: string
          level?: number
          name: string
          streak?: number
          tier?: string
          updated_at?: string
          user_id: string
          xp?: number
          year: number
        }
        Update: {
          avatar?: string
          branch?: string
          career_goal?: string
          created_at?: string
          degree?: string
          email?: string
          id?: string
          interests?: string[]
          last_activity?: string
          level?: number
          name?: string
          streak?: number
          tier?: string
          updated_at?: string
          user_id?: string
          xp?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          streak: number
          title: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          category: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          streak?: number
          title: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          streak?: number
          title?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      problem_submissions: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          solved: boolean
          time_spent: number | null
          solution_code: string | null
          language: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          problem_id: string
          solved: boolean
          time_spent?: number | null
          solution_code?: string | null
          language?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          problem_id?: string
          solved?: boolean
          time_spent?: number | null
          solution_code?: string | null
          language?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_problems"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_challenges: {
        Row: {
          id: string
          date: string
          problem_id: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          problem_id: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          problem_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_problems"
            referencedColumns: ["id"]
          }
        ]
      }
      user_app_data: {
        Row: {
          id: string
          user_id: string
          time_based_streak: Json | null
          daily_reset: Json | null
          activity_timer: Json | null
          accountability_data: Json | null
          internship_milestones: Json | null
          non_negotiables: Json | null
          profile_stats: Json | null
          integration_data: Json | null
          app_preferences: Json | null
          contacts: Json | null
          bucket_list: Json | null
          mindfulness: Json | null
          projects: Json | null
          skills: Json | null
          challenges: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          time_based_streak?: Json | null
          daily_reset?: Json | null
          activity_timer?: Json | null
          accountability_data?: Json | null
          internship_milestones?: Json | null
          non_negotiables?: Json | null
          profile_stats?: Json | null
          integration_data?: Json | null
          app_preferences?: Json | null
          contacts?: Json | null
          bucket_list?: Json | null
          mindfulness?: Json | null
          projects?: Json | null
          skills?: Json | null
          challenges?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          time_based_streak?: Json | null
          daily_reset?: Json | null
          activity_timer?: Json | null
          accountability_data?: Json | null
          internship_milestones?: Json | null
          non_negotiables?: Json | null
          profile_stats?: Json | null
          integration_data?: Json | null
          app_preferences?: Json | null
          contacts?: Json | null
          bucket_list?: Json | null
          mindfulness?: Json | null
          projects?: Json | null
          skills?: Json | null
          challenges?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      power_ups: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          duration: number
          cooldown: number
          effects: Json | null
          icon: string | null
          rarity: string
          unlocked: boolean
          uses: number
          max_uses: number
          last_used: string | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          type: string
          duration?: number
          cooldown?: number
          effects?: Json | null
          icon?: string | null
          rarity: string
          unlocked?: boolean
          uses?: number
          max_uses?: number
          last_used?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          duration?: number
          cooldown?: number
          effects?: Json | null
          icon?: string | null
          rarity?: string
          unlocked?: boolean
          uses?: number
          max_uses?: number
          last_used?: string | null
        }
        Relationships: []
      }
      user_power_ups: {
        Row: {
          id: string
          user_id: string
          power_up_id: string
          unlocked: boolean
          uses: number
          last_used: string | null
          expires_at: string | null
          active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          power_up_id: string
          unlocked?: boolean
          uses?: number
          last_used?: string | null
          expires_at?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          power_up_id?: string
          unlocked?: boolean
          uses?: number
          last_used?: string | null
          expires_at?: string | null
          active?: boolean
        }
        Relationships: []
      }
      shop_rewards: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          rarity: string
          cost: number
          value: number | null
          duration: number | null
          max_stack: number | null
          cooldown: number | null
          requirements: Json | null
          effects: Json | null
          icon: string | null
          unlocked: boolean
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          category: string
          rarity: string
          cost: number
          value?: number | null
          duration?: number | null
          max_stack?: number | null
          cooldown?: number | null
          requirements?: Json | null
          effects?: Json | null
          icon?: string | null
          unlocked?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          rarity?: string
          cost?: number
          value?: number | null
          duration?: number | null
          max_stack?: number | null
          cooldown?: number | null
          requirements?: Json | null
          effects?: Json | null
          icon?: string | null
          unlocked?: boolean
        }
        Relationships: []
      }
      user_shop_purchases: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          purchased: boolean
          purchase_count: number
          last_purchased: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          reward_id: string
          purchased?: boolean
          purchase_count?: number
          last_purchased?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          reward_id?: string
          purchased?: boolean
          purchase_count?: number
          last_purchased?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      placement_quests: {
        Row: {
          id: string
          title: string
          description: string | null
          xp_reward: number
          time_minutes: number | null
          recurrence: string
          difficulty: string
          category: string
          is_boss_quest: boolean
          required_streak: number | null
          prerequisites: string[] | null
          bonus_xp: number | null
          combo_multiplier: number | null
          created_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          xp_reward: number
          time_minutes?: number | null
          recurrence: string
          difficulty: string
          category: string
          is_boss_quest?: boolean
          required_streak?: number | null
          prerequisites?: string[] | null
          bonus_xp?: number | null
          combo_multiplier?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          xp_reward?: number
          time_minutes?: number | null
          recurrence?: string
          difficulty?: string
          category?: string
          is_boss_quest?: boolean
          required_streak?: number | null
          prerequisites?: string[] | null
          bonus_xp?: number | null
          combo_multiplier?: number | null
          created_at?: string
        }
        Relationships: []
      }
      user_quests_status: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          last_completed_at: string | null
          completed_count: number
          streak: number
          overdue: boolean
          penalty_applied: number
          last_penalty_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          quest_id: string
          last_completed_at?: string | null
          completed_count?: number
          streak?: number
          overdue?: boolean
          penalty_applied?: number
          last_penalty_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          quest_id?: string
          last_completed_at?: string | null
          completed_count?: number
          streak?: number
          overdue?: boolean
          penalty_applied?: number
          last_penalty_date?: string | null
        }
        Relationships: []
      }
      quest_achievements: {
        Row: {
          id: string
          title: string
          description: string | null
          icon: string | null
          progress: number
          max_progress: number
          created_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          icon?: string | null
          progress?: number
          max_progress: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon?: string | null
          progress?: number
          max_progress?: number
          created_at?: string
        }
        Relationships: []
      }
      user_quest_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked: boolean
          unlocked_at: string | null
          progress: number
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked?: boolean
          unlocked_at?: string | null
          progress?: number
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked?: boolean
          unlocked_at?: string | null
          progress?: number
        }
        Relationships: []
      }
      user_energy: {
        Row: {
          id: string
          user_id: string
          current: number
          max: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current?: number
          max?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current?: number
          max?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
