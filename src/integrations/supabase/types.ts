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
      appointments: {
        Row: {
          appointment_type: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          notes: string | null
          patient_id: string | null
          provider_id: string | null
          scheduled_date: string
          scheduled_time: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          provider_id?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          patient_id?: string | null
          provider_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      attorney_referrals: {
        Row: {
          account_balance_at_referral: number
          attorney_contact: string | null
          attorney_email: string | null
          attorney_firm: string
          attorney_phone: string | null
          case_number: string | null
          collection_account_id: string
          created_at: string
          expected_action: string | null
          id: string
          notes: string | null
          referral_amount: number
          referral_date: string
          referral_status: Database["public"]["Enums"]["attorney_referral_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_balance_at_referral: number
          attorney_contact?: string | null
          attorney_email?: string | null
          attorney_firm: string
          attorney_phone?: string | null
          case_number?: string | null
          collection_account_id: string
          created_at?: string
          expected_action?: string | null
          id?: string
          notes?: string | null
          referral_amount: number
          referral_date?: string
          referral_status?: Database["public"]["Enums"]["attorney_referral_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_balance_at_referral?: number
          attorney_contact?: string | null
          attorney_email?: string | null
          attorney_firm?: string
          attorney_phone?: string | null
          case_number?: string | null
          collection_account_id?: string
          created_at?: string
          expected_action?: string | null
          id?: string
          notes?: string | null
          referral_amount?: number
          referral_date?: string
          referral_status?: Database["public"]["Enums"]["attorney_referral_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attorney_referrals_collection_account_id_fkey"
            columns: ["collection_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      authorization_requests: {
        Row: {
          ack_status: string | null
          auth_number: string | null
          clinical_indication: string | null
          created_at: string | null
          diagnosis_codes: string[] | null
          id: string
          pa_required: boolean | null
          patient_dob: string | null
          patient_gender: string | null
          patient_id: string | null
          patient_member_id: string | null
          patient_name: string
          payer_id: string | null
          payer_name: string | null
          procedure_codes: string[] | null
          requested_date: string | null
          service_end_date: string | null
          service_start_date: string | null
          service_type: string | null
          status: string | null
          units_requested: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ack_status?: string | null
          auth_number?: string | null
          clinical_indication?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          id?: string
          pa_required?: boolean | null
          patient_dob?: string | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_member_id?: string | null
          patient_name: string
          payer_id?: string | null
          payer_name?: string | null
          procedure_codes?: string[] | null
          requested_date?: string | null
          service_end_date?: string | null
          service_start_date?: string | null
          service_type?: string | null
          status?: string | null
          units_requested?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ack_status?: string | null
          auth_number?: string | null
          clinical_indication?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          id?: string
          pa_required?: boolean | null
          patient_dob?: string | null
          patient_gender?: string | null
          patient_id?: string | null
          patient_member_id?: string | null
          patient_name?: string
          payer_id?: string | null
          payer_name?: string | null
          procedure_codes?: string[] | null
          requested_date?: string | null
          service_end_date?: string | null
          service_start_date?: string | null
          service_type?: string | null
          status?: string | null
          units_requested?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      collection_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["collection_activity_type"]
          amount_discussed: number | null
          collection_account_id: string
          contact_method: Database["public"]["Enums"]["contact_method"] | null
          created_at: string
          id: string
          notes: string | null
          outcome: string | null
          performed_by: string | null
          promise_to_pay_date: string | null
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["collection_activity_type"]
          amount_discussed?: number | null
          collection_account_id: string
          contact_method?: Database["public"]["Enums"]["contact_method"] | null
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          performed_by?: string | null
          promise_to_pay_date?: string | null
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["collection_activity_type"]
          amount_discussed?: number | null
          collection_account_id?: string
          contact_method?: Database["public"]["Enums"]["contact_method"] | null
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          performed_by?: string | null
          promise_to_pay_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_activities_collection_account_id_fkey"
            columns: ["collection_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_letters: {
        Row: {
          collection_account_id: string
          created_at: string
          delivery_status: string | null
          id: string
          letter_type: Database["public"]["Enums"]["letter_type"]
          pdf_url: string | null
          sent_date: string
          template_name: string
          user_id: string
        }
        Insert: {
          collection_account_id: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          letter_type: Database["public"]["Enums"]["letter_type"]
          pdf_url?: string | null
          sent_date?: string
          template_name: string
          user_id: string
        }
        Update: {
          collection_account_id?: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          letter_type?: Database["public"]["Enums"]["letter_type"]
          pdf_url?: string | null
          sent_date?: string
          template_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_letters_collection_account_id_fkey"
            columns: ["collection_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_accounts: {
        Row: {
          assigned_to: string | null
          collection_stage: Database["public"]["Enums"]["collection_stage"]
          collection_status: Database["public"]["Enums"]["collection_status"]
          created_at: string
          current_balance: number
          days_overdue: number
          id: string
          last_contact_date: string | null
          next_action_date: string | null
          notes: string | null
          original_balance: number
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          collection_stage?: Database["public"]["Enums"]["collection_stage"]
          collection_status?: Database["public"]["Enums"]["collection_status"]
          created_at?: string
          current_balance: number
          days_overdue?: number
          id?: string
          last_contact_date?: string | null
          next_action_date?: string | null
          notes?: string | null
          original_balance: number
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          collection_stage?: Database["public"]["Enums"]["collection_stage"]
          collection_status?: Database["public"]["Enums"]["collection_status"]
          created_at?: string
          current_balance?: number
          days_overdue?: number
          id?: string
          last_contact_date?: string | null
          next_action_date?: string | null
          notes?: string | null
          original_balance?: number
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dispute_claims: {
        Row: {
          collection_account_id: string
          created_at: string
          dispute_date: string
          dispute_reason: string
          dispute_status: Database["public"]["Enums"]["dispute_status"]
          id: string
          resolution_date: string | null
          resolution_notes: string | null
          supporting_documents: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_account_id: string
          created_at?: string
          dispute_date?: string
          dispute_reason: string
          dispute_status?: Database["public"]["Enums"]["dispute_status"]
          id?: string
          resolution_date?: string | null
          resolution_notes?: string | null
          supporting_documents?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_account_id?: string
          created_at?: string
          dispute_date?: string
          dispute_reason?: string
          dispute_status?: Database["public"]["Enums"]["dispute_status"]
          id?: string
          resolution_date?: string | null
          resolution_notes?: string | null
          supporting_documents?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_claims_collection_account_id_fkey"
            columns: ["collection_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          emergency_contact_relationship: string | null
          ethnicity: string | null
          first_name: string
          gender: string | null
          id: string
          language: string | null
          last_name: string
          marital_status: string | null
          patient_id: string
          phone: string | null
          phone_primary: string | null
          race: string | null
          ssn: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          emergency_contact_relationship?: string | null
          ethnicity?: string | null
          first_name: string
          gender?: string | null
          id?: string
          language?: string | null
          last_name: string
          marital_status?: string | null
          patient_id: string
          phone?: string | null
          phone_primary?: string | null
          race?: string | null
          ssn?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          emergency_contact_relationship?: string | null
          ethnicity?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          language?: string | null
          last_name?: string
          marital_status?: string | null
          patient_id?: string
          phone?: string | null
          phone_primary?: string | null
          race?: string | null
          ssn?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      payment_installments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          payment_method: string | null
          payment_plan_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          payment_plan_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          payment_plan_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_installments_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          auto_pay: boolean | null
          created_at: string | null
          down_payment: number | null
          end_date: string
          id: string
          monthly_payment: number
          notes: string | null
          number_of_payments: number
          payments_completed: number | null
          remaining_balance: number
          start_date: string
          statement_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_pay?: boolean | null
          created_at?: string | null
          down_payment?: number | null
          end_date: string
          id?: string
          monthly_payment: number
          notes?: string | null
          number_of_payments: number
          payments_completed?: number | null
          remaining_balance: number
          start_date: string
          statement_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_pay?: boolean | null
          created_at?: string | null
          down_payment?: number | null
          end_date?: string
          id?: string
          monthly_payment?: number
          notes?: string | null
          number_of_payments?: number
          payments_completed?: number | null
          remaining_balance?: number
          start_date?: string
          statement_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "billing_statements"
            referencedColumns: ["id"]
          },
        ]
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
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          npi: string
          phone: string | null
          specialty: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          npi: string
          phone?: string | null
          specialty?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          npi?: string
          phone?: string | null
          specialty?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settlement_offers: {
        Row: {
          accepted_date: string | null
          collection_account_id: string
          created_at: string
          expiration_date: string
          id: string
          notes: string | null
          offer_amount: number
          offer_percentage: number
          original_amount: number
          payment_terms: string | null
          settlement_status: Database["public"]["Enums"]["settlement_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_date?: string | null
          collection_account_id: string
          created_at?: string
          expiration_date: string
          id?: string
          notes?: string | null
          offer_amount: number
          offer_percentage: number
          original_amount: number
          payment_terms?: string | null
          settlement_status?: Database["public"]["Enums"]["settlement_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_date?: string | null
          collection_account_id?: string
          created_at?: string
          expiration_date?: string
          id?: string
          notes?: string | null
          offer_amount?: number
          offer_percentage?: number
          original_amount?: number
          payment_terms?: string | null
          settlement_status?: Database["public"]["Enums"]["settlement_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_offers_collection_account_id_fkey"
            columns: ["collection_account_id"]
            isOneToOne: false
            referencedRelation: "collections_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_collection_account: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      owns_payment_plan: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "billing_staff" | "admin"
      attorney_referral_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "judgment_obtained"
        | "collecting"
        | "closed"
        | "returned"
      billing_frequency: "weekly" | "bi_weekly" | "monthly" | "quarterly"
      chat_status: "active" | "resolved" | "escalated" | "closed"
      collection_activity_type:
        | "phone_call"
        | "email_sent"
        | "letter_sent"
        | "dispute_received"
        | "promise_to_pay"
        | "partial_payment"
        | "settlement_offer"
        | "note_added"
      collection_stage:
        | "early_collection"
        | "mid_collection"
        | "late_collection"
        | "pre_legal"
      collection_status:
        | "active"
        | "payment_plan"
        | "settled"
        | "attorney_referral"
        | "closed"
        | "dispute"
      communication_channel: "email" | "sms" | "paper" | "portal"
      contact_method: "phone" | "email" | "mail" | "sms" | "in_person"
      dispute_status:
        | "open"
        | "investigating"
        | "resolved_patient_favor"
        | "resolved_practice_favor"
        | "closed"
      letter_type:
        | "initial_notice"
        | "second_notice"
        | "final_notice"
        | "pre_legal_notice"
        | "cease_communication"
        | "settlement_agreement"
      settlement_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "expired"
        | "completed"
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
      app_role: ["patient", "billing_staff", "admin"],
      attorney_referral_status: [
        "pending",
        "accepted",
        "in_progress",
        "judgment_obtained",
        "collecting",
        "closed",
        "returned",
      ],
      billing_frequency: ["weekly", "bi_weekly", "monthly", "quarterly"],
      chat_status: ["active", "resolved", "escalated", "closed"],
      collection_activity_type: [
        "phone_call",
        "email_sent",
        "letter_sent",
        "dispute_received",
        "promise_to_pay",
        "partial_payment",
        "settlement_offer",
        "note_added",
      ],
      collection_stage: [
        "early_collection",
        "mid_collection",
        "late_collection",
        "pre_legal",
      ],
      collection_status: [
        "active",
        "payment_plan",
        "settled",
        "attorney_referral",
        "closed",
        "dispute",
      ],
      communication_channel: ["email", "sms", "paper", "portal"],
      contact_method: ["phone", "email", "mail", "sms", "in_person"],
      dispute_status: [
        "open",
        "investigating",
        "resolved_patient_favor",
        "resolved_practice_favor",
        "closed",
      ],
      letter_type: [
        "initial_notice",
        "second_notice",
        "final_notice",
        "pre_legal_notice",
        "cease_communication",
        "settlement_agreement",
      ],
      settlement_status: [
        "pending",
        "accepted",
        "rejected",
        "expired",
        "completed",
      ],
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
