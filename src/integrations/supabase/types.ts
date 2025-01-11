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
          sets?: number
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
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          payment_mode: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_mode: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_templates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_number: string
          membership_id: string
          paid_at: string | null
          payment_mode: string | null
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_number: string
          membership_id: string
          paid_at?: string | null
          payment_mode?: string | null
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string
          membership_id?: string
          paid_at?: string | null
          payment_mode?: string | null
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "user_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          id?: string
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
          plan_id?: string
          start_date?: string
          status?: string
          user_id?: string
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
          user_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
