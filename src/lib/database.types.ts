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