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
      api_usage: {
        Row: {
          api_type: string
          client_id: string | null
          cost: number | null
          created_at: string
          id: string
          request_data: Json | null
          response_data: Json | null
          telegram_id: number | null
          tokens_used: number | null
        }
        Insert: {
          api_type: string
          client_id?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          telegram_id?: number | null
          tokens_used?: number | null
        }
        Update: {
          api_type?: string
          client_id?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          telegram_id?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by_telegram_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by_telegram_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by_telegram_id?: number | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_by_telegram_id: number
          created_at: string
          id: string
          reason: string | null
          telegram_id: number
          updated_at: string
        }
        Insert: {
          blocked_by_telegram_id: number
          created_at?: string
          id?: string
          reason?: string | null
          telegram_id: number
          updated_at?: string
        }
        Update: {
          blocked_by_telegram_id?: number
          created_at?: string
          id?: string
          reason?: string | null
          telegram_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversation_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          session_title: string | null
          telegram_id: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          session_title?: string | null
          telegram_id?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          session_title?: string | null
          telegram_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string | null
          telegram_id: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id?: string | null
          telegram_id?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string | null
          telegram_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_active: string | null
          last_name: string
          phone: string | null
          status: string
          telegram_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_active?: string | null
          last_name: string
          phone?: string | null
          status?: string
          telegram_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_active?: string | null
          last_name?: string
          phone?: string | null
          status?: string
          telegram_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cost_tracking: {
        Row: {
          amount: number
          cost_type: string
          currency: string | null
          id: string
          recorded_at: string | null
          service_name: string | null
          telegram_id: number
          usage_details: Json | null
          user_id: string | null
        }
        Insert: {
          amount: number
          cost_type: string
          currency?: string | null
          id?: string
          recorded_at?: string | null
          service_name?: string | null
          telegram_id: number
          usage_details?: Json | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          cost_type?: string
          currency?: string | null
          id?: string
          recorded_at?: string | null
          service_name?: string | null
          telegram_id?: number
          usage_details?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diamonds: {
        Row: {
          carat: number
          clarity: string
          color: string
          created_at: string | null
          cut: string
          id: string
          price: number
          user_id: string
        }
        Insert: {
          carat: number
          clarity: string
          color: string
          created_at?: string | null
          cut: string
          id?: string
          price: number
          user_id: string
        }
        Update: {
          carat?: number
          clarity?: string
          color?: string
          created_at?: string | null
          cut?: string
          id?: string
          price?: number
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          certificate_comment: string | null
          certificate_number: number | null
          certificate_url: string | null
          clarity: string
          color: string
          created_at: string
          culet: string | null
          cut: string | null
          deleted_at: string | null
          depth: number | null
          depth_percentage: number | null
          fluorescence: string | null
          gridle: string | null
          id: string
          lab: string | null
          length: number | null
          picture: string | null
          polish: string | null
          price_per_carat: number | null
          rapnet: number | null
          ratio: number | null
          shape: string
          status: string | null
          stock_number: string
          store_visible: boolean | null
          symmetry: string | null
          table_percentage: number | null
          updated_at: string
          user_id: number
          weight: number
          width: number | null
        }
        Insert: {
          certificate_comment?: string | null
          certificate_number?: number | null
          certificate_url?: string | null
          clarity: string
          color: string
          created_at?: string
          culet?: string | null
          cut?: string | null
          deleted_at?: string | null
          depth?: number | null
          depth_percentage?: number | null
          fluorescence?: string | null
          gridle?: string | null
          id?: string
          lab?: string | null
          length?: number | null
          picture?: string | null
          polish?: string | null
          price_per_carat?: number | null
          rapnet?: number | null
          ratio?: number | null
          shape: string
          status?: string | null
          stock_number: string
          store_visible?: boolean | null
          symmetry?: string | null
          table_percentage?: number | null
          updated_at?: string
          user_id: number
          weight: number
          width?: number | null
        }
        Update: {
          certificate_comment?: string | null
          certificate_number?: number | null
          certificate_url?: string | null
          clarity?: string
          color?: string
          created_at?: string
          culet?: string | null
          cut?: string | null
          deleted_at?: string | null
          depth?: number | null
          depth_percentage?: number | null
          fluorescence?: string | null
          gridle?: string | null
          id?: string
          lab?: string | null
          length?: number | null
          picture?: string | null
          polish?: string | null
          price_per_carat?: number | null
          rapnet?: number | null
          ratio?: number | null
          shape?: string
          status?: string | null
          stock_number?: string
          store_visible?: boolean | null
          symmetry?: string | null
          table_percentage?: number | null
          updated_at?: string
          user_id?: number
          weight?: number
          width?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          message_content: string
          message_type: string
          metadata: Json | null
          read_at: string | null
          sent_at: string
          status: string
          telegram_id: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_content: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string
          status?: string
          telegram_id: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_content?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string
          status?: string
          telegram_id?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_visits: {
        Row: {
          created_at: string | null
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          time_spent: unknown | null
          visit_timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          time_spent?: unknown | null
          visit_timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          time_spent?: unknown | null
          visit_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_visits_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          plan_name: string
          start_date: string | null
          status: string
          telegram_id: number
          trial_end_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          plan_name: string
          start_date?: string | null
          status?: string
          telegram_id: number
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          plan_name?: string
          start_date?: string | null
          status?: string
          telegram_id?: number
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          api_calls_count: number | null
          cost_per_user: number | null
          created_at: string | null
          id: string
          last_active: string | null
          lifetime_value: number | null
          profit_loss: number | null
          revenue_per_user: number | null
          storage_used_mb: number | null
          subscription_status: string | null
          telegram_id: number
          total_time_spent: unknown | null
          total_visits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_calls_count?: number | null
          cost_per_user?: number | null
          created_at?: string | null
          id?: string
          last_active?: string | null
          lifetime_value?: number | null
          profit_loss?: number | null
          revenue_per_user?: number | null
          storage_used_mb?: number | null
          subscription_status?: string | null
          telegram_id: number
          total_time_spent?: unknown | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_calls_count?: number | null
          cost_per_user?: number | null
          created_at?: string | null
          id?: string
          last_active?: string | null
          lifetime_value?: number | null
          profit_loss?: number | null
          revenue_per_user?: number | null
          storage_used_mb?: number | null
          subscription_status?: string | null
          telegram_id?: number
          total_time_spent?: unknown | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_management_log: {
        Row: {
          action_type: string
          admin_telegram_id: number
          changes: Json | null
          created_at: string | null
          id: string
          reason: string | null
          target_telegram_id: number | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_telegram_id: number
          changes?: Json | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_telegram_id?: number | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_telegram_id?: number
          changes?: Json | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_telegram_id?: number | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          is_premium: boolean | null
          language_code: string | null
          last_login: string | null
          last_name: string | null
          notes: string | null
          payment_status: string | null
          phone_number: string | null
          photo_url: string | null
          status: string | null
          subscription_plan: string | null
          telegram_id: number
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          is_premium?: boolean | null
          language_code?: string | null
          last_login?: string | null
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone_number?: string | null
          photo_url?: string | null
          status?: string | null
          subscription_plan?: string | null
          telegram_id: number
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          is_premium?: boolean | null
          language_code?: string | null
          last_login?: string | null
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone_number?: string | null
          photo_url?: string | null
          status?: string | null
          subscription_plan?: string | null
          telegram_id?: number
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          pages_visited: number | null
          session_end: string | null
          session_start: string | null
          telegram_id: number
          total_duration: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pages_visited?: number | null
          session_end?: string | null
          session_start?: string | null
          telegram_id: number
          total_duration?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pages_visited?: number | null
          session_end?: string | null
          session_start?: string | null
          telegram_id?: number
          total_duration?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_diamond: {
        Args: { p_stock_number: string; p_user_id: number }
        Returns: boolean
      }
      delete_diamond_by_stock: {
        Args: { p_stock_number: string; p_user_id: number }
        Returns: boolean
      }
      get_user_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          active_users: number
          premium_users: number
          blocked_users: number
          users_with_phone: number
          recent_signups: number
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
