export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_assessments: {
        Row: {
          assessment_type: string
          created_at: string
          criteria: Json
          feedback: Json
          id: string
          project_id: string
          score: number
          suggestions: string[] | null
          target_id: string | null
        }
        Insert: {
          assessment_type: string
          created_at?: string
          criteria: Json
          feedback: Json
          id?: string
          project_id: string
          score: number
          suggestions?: string[] | null
          target_id?: string | null
        }
        Update: {
          assessment_type?: string
          created_at?: string
          criteria?: Json
          feedback?: Json
          id?: string
          project_id?: string
          score?: number
          suggestions?: string[] | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assessments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_projects: {
        Row: {
          competition_group: string
          course_name: string
          created_at: string
          current_stage: string
          id: string
          status: string
          title: string
          total_hours: number
          updated_at: string
          user_id: string
        }
        Insert: {
          competition_group: string
          course_name: string
          created_at?: string
          current_stage?: string
          id?: string
          status?: string
          title: string
          total_hours: number
          updated_at?: string
          user_id: string
        }
        Update: {
          competition_group?: string
          course_name?: string
          created_at?: string
          current_stage?: string
          id?: string
          status?: string
          title?: string
          total_hours?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      final_materials: {
        Row: {
          ai_score: number | null
          ai_suggestions: Json | null
          content: Json
          created_at: string
          id: string
          material_type: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_score?: number | null
          ai_suggestions?: Json | null
          content: Json
          created_at?: string
          id?: string
          material_type: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_score?: number | null
          ai_suggestions?: Json | null
          content?: Json
          created_at?: string
          id?: string
          material_type?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_reports: {
        Row: {
          ai_feedback: Json | null
          ai_score: number | null
          chart_count: number
          content: Json
          created_at: string
          id: string
          project_id: string
          status: string
          updated_at: string
          version: number
          word_count: number
        }
        Insert: {
          ai_feedback?: Json | null
          ai_score?: number | null
          chart_count?: number
          content: Json
          created_at?: string
          id?: string
          project_id: string
          status?: string
          updated_at?: string
          version?: number
          word_count?: number
        }
        Update: {
          ai_feedback?: Json | null
          ai_score?: number | null
          chart_count?: number
          content?: Json
          created_at?: string
          id?: string
          project_id?: string
          status?: string
          updated_at?: string
          version?: number
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "implementation_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          ai_feedback: Json | null
          ai_score: number | null
          content: Json
          created_at: string
          difficult_points: string[] | null
          duration_minutes: number
          id: string
          key_points: string[] | null
          lesson_number: number
          objectives: string
          project_id: string
          status: string
          teaching_methods: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_feedback?: Json | null
          ai_score?: number | null
          content: Json
          created_at?: string
          difficult_points?: string[] | null
          duration_minutes?: number
          id?: string
          key_points?: string[] | null
          lesson_number: number
          objectives: string
          project_id: string
          status?: string
          teaching_methods?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_feedback?: Json | null
          ai_score?: number | null
          content?: Json
          created_at?: string
          difficult_points?: string[] | null
          duration_minutes?: number
          id?: string
          key_points?: string[] | null
          lesson_number?: number
          objectives?: string
          project_id?: string
          status?: string
          teaching_methods?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_tracking: {
        Row: {
          completed_at: string | null
          completion_percentage: number
          created_at: string
          id: string
          notes: string | null
          project_id: string
          stage: string
          status: string
          step: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          id?: string
          notes?: string | null
          project_id: string
          stage: string
          status?: string
          step: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string
          stage?: string
          status?: string
          step?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          experience_years: number | null
          id: string
          name: string
          project_id: string
          role: string
          specialties: string[] | null
          title: string | null
        }
        Insert: {
          created_at?: string
          experience_years?: number | null
          id?: string
          name: string
          project_id: string
          role: string
          specialties?: string[] | null
          title?: string | null
        }
        Update: {
          created_at?: string
          experience_years?: number | null
          id?: string
          name?: string
          project_id?: string
          role?: string
          specialties?: string[] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          mime_type: string
          project_id: string
          related_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          mime_type: string
          project_id: string
          related_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string
          project_id?: string
          related_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      video_scripts: {
        Row: {
          ai_suggestions: Json | null
          created_at: string
          duration_minutes: number
          id: string
          ideological_points: string[] | null
          interaction_points: string[] | null
          key_moments: string[] | null
          lesson_plan_id: string | null
          project_id: string
          script_content: Json
          status: string
          tech_integration_points: string[] | null
          title: string
          updated_at: string
          video_number: number
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string
          duration_minutes?: number
          id?: string
          ideological_points?: string[] | null
          interaction_points?: string[] | null
          key_moments?: string[] | null
          lesson_plan_id?: string | null
          project_id: string
          script_content: Json
          status?: string
          tech_integration_points?: string[] | null
          title: string
          updated_at?: string
          video_number: number
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string
          duration_minutes?: number
          id?: string
          ideological_points?: string[] | null
          interaction_points?: string[] | null
          key_moments?: string[] | null
          lesson_plan_id?: string | null
          project_id?: string
          script_content?: Json
          status?: string
          tech_integration_points?: string[] | null
          title?: string
          updated_at?: string
          video_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_scripts_lesson_plan_id_fkey"
            columns: ["lesson_plan_id"]
            isOneToOne: false
            referencedRelation: "lesson_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_scripts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "competition_projects"
            referencedColumns: ["id"]
          },
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
