export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_config: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_messages_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_daily: {
        Row: {
          active_members: number
          created_at: string
          date: string
          id: string
          new_memberships: number
          total_visits: number
        }
        Insert: {
          active_members?: number
          created_at?: string
          date: string
          id?: string
          new_memberships?: number
          total_visits?: number
        }
        Update: {
          active_members?: number
          created_at?: string
          date?: string
          id?: string
          new_memberships?: number
          total_visits?: number
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string | null
          message_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string | null
          message_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string | null
          message_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_workout_days: {
        Row: {
          created_at: string
          day_number: number
          id: string
          week_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          week_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_workout_days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "dedicated_workout_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_workout_exercises: {
        Row: {
          created_at: string
          day_id: string
          exercise_id: string
          id: string
          notes: string | null
          reps: number | null
          sets: number
        }
        Insert: {
          created_at?: string
          day_id: string
          exercise_id: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets: number
        }
        Update: {
          created_at?: string
          day_id?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_workout_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "dedicated_workout_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dedicated_workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_workout_weeks: {
        Row: {
          created_at: string
          id: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_workout_weeks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string
          goal_id: string
          id: string
          image_url: string | null
          muscle_group: string
          name: string
          sets: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level: string
          goal_id: string
          id?: string
          image_url?: string | null
          muscle_group: string
          name: string
          sets?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string
          goal_id?: string
          id?: string
          image_url?: string | null
          muscle_group?: string
          name?: string
          sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercises_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "workout_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_history: {
        Row: {
          created_at: string
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          plan_id: string
          start_date: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          custom_duration: boolean | null
          description: string | null
          duration_months: number
          features: Json | null
          id: string
          max_duration_months: number | null
          min_duration_months: number | null
          name: string
          price: number
          subscribers_count: number
        }
        Insert: {
          created_at?: string
          custom_duration?: boolean | null
          description?: string | null
          duration_months: number
          features?: Json | null
          id?: string
          max_duration_months?: number | null
          min_duration_months?: number | null
          name: string
          price: number
          subscribers_count?: number
        }
        Update: {
          created_at?: string
          custom_duration?: boolean | null
          description?: string | null
          duration_months?: number
          features?: Json | null
          id?: string
          max_duration_months?: number | null
          min_duration_months?: number | null
          name?: string
          price?: number
          subscribers_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          push_subscription: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          push_subscription?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone_number?: string | null
          push_subscription?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          created_at: string
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          plan_id: string
          start_date: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          plan_id: string
          start_date?: string
          status?: string
          user_id: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_memberships_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_messages: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          updated_at?: string
          user_id: string
        }
        Relationships: [
          {
            foreignKeyName: "user_messages_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_goals: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_workout_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "workout_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string
          duration: number | null
          id: string
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty_level: string
          duration?: number | null
          id: string
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      workout_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_daily_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_expired_memberships: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
