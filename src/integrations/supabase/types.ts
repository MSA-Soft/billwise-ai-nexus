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
      billing_cycles: {
        Row: {
          created_at: string | null
          day_of_cycle: number
          frequency: Database["public"]["Enums"]["billing_frequency"]
          id: string
          is_active: boolean | null
          name: string
          reminder_days: number[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_cycle?: number
          frequency?: Database["public"]["Enums"]["billing_frequency"]
          id?: string
          is_active?: boolean | null
          name: string
          reminder_days?: number[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_cycle?: number
          frequency?: Database["public"]["Enums"]["billing_frequency"]
          id?: string
          is_active?: boolean | null
          name?: string
          reminder_days?: number[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_statements: {
        Row: {
          amount_due: number
          channel: Database["public"]["Enums"]["communication_channel"] | null
          created_at: string | null
          delivered_at: string | null
          due_date: string | null
          error_message: string | null
          id: string
          paid_at: string | null
          patient_id: string
          patient_name: string
          pdf_url: string | null
          sent_at: string | null
          statement_date: string
          status: Database["public"]["Enums"]["statement_status"] | null
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          amount_due: number
          channel?: Database["public"]["Enums"]["communication_channel"] | null
          created_at?: string | null
          delivered_at?: string | null
          due_date?: string | null
          error_message?: string | null
          id?: string
          paid_at?: string | null
          patient_id: string
          patient_name: string
          pdf_url?: string | null
          sent_at?: string | null
          statement_date?: string
          status?: Database["public"]["Enums"]["statement_status"] | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          amount_due?: number
          channel?: Database["public"]["Enums"]["communication_channel"] | null
          created_at?: string | null
          delivered_at?: string | null
          due_date?: string | null
          error_message?: string | null
          id?: string
          paid_at?: string | null
          patient_id?: string
          patient_name?: string
          pdf_url?: string | null
          sent_at?: string | null
          statement_date?: string
          status?: Database["public"]["Enums"]["statement_status"] | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          ended_at: string | null
          escalated_at: string | null
          id: string
          patient_id: string
          patient_name: string
          started_at: string | null
          status: Database["public"]["Enums"]["chat_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          escalated_at?: string | null
          id?: string
          patient_id: string
          patient_name: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["chat_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          escalated_at?: string | null
          id?: string
          patient_id?: string
          patient_name?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["chat_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          is_ai: boolean | null
          message: string
          sender_name: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          message: string
          sender_name?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_ai?: boolean | null
          message?: string
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_communication_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          paper_enabled: boolean | null
          patient_email: string | null
          patient_id: string
          patient_name: string
          patient_phone: string | null
          portal_enabled: boolean | null
          preferred_channel: Database["public"]["Enums"]["communication_channel"]
          sms_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          paper_enabled?: boolean | null
          patient_email?: string | null
          patient_id: string
          patient_name: string
          patient_phone?: string | null
          portal_enabled?: boolean | null
          preferred_channel?: Database["public"]["Enums"]["communication_channel"]
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          paper_enabled?: boolean | null
          patient_email?: string | null
          patient_id?: string
          patient_name?: string
          patient_phone?: string | null
          portal_enabled?: boolean | null
          preferred_channel?: Database["public"]["Enums"]["communication_channel"]
          sms_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"]
          created_at: string | null
          id: string
          patient_id: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          statement_id: string | null
          status: Database["public"]["Enums"]["statement_status"] | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["communication_channel"]
          created_at?: string | null
          id?: string
          patient_id: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          statement_id?: string | null
          status?: Database["public"]["Enums"]["statement_status"] | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          created_at?: string | null
          id?: string
          patient_id?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          statement_id?: string | null
          status?: Database["public"]["Enums"]["statement_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "billing_statements"
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
      billing_frequency: "weekly" | "bi_weekly" | "monthly" | "quarterly"
      chat_status: "active" | "resolved" | "escalated" | "closed"
      communication_channel: "email" | "sms" | "paper" | "portal"
      statement_status:
        | "pending"
        | "sent"
        | "delivered"
        | "failed"
        | "viewed"
        | "paid"
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
    Enums: {
      billing_frequency: ["weekly", "bi_weekly", "monthly", "quarterly"],
      chat_status: ["active", "resolved", "escalated", "closed"],
      communication_channel: ["email", "sms", "paper", "portal"],
      statement_status: [
        "pending",
        "sent",
        "delivered",
        "failed",
        "viewed",
        "paid",
      ],
    },
  },
} as const
