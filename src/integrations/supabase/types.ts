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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blockchain_transactions: {
        Row: {
          block_number: number | null
          confirmations: number | null
          confirmed_at: string | null
          contract_address: string | null
          created_at: string | null
          gas_price: number | null
          gas_used: number | null
          id: string
          network: string
          status: string | null
          transaction_hash: string
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          block_number?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          contract_address?: string | null
          created_at?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network?: string
          status?: string | null
          transaction_hash: string
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          block_number?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          contract_address?: string | null
          created_at?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network?: string
          status?: string | null
          transaction_hash?: string
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          can_add_members: boolean | null
          can_edit_info: boolean | null
          can_send_messages: boolean | null
          chat_id: string | null
          id: string
          joined_at: string | null
          last_read_at: string | null
          muted_until: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          can_add_members?: boolean | null
          can_edit_info?: boolean | null
          can_send_messages?: boolean | null
          chat_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          muted_until?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          can_add_members?: boolean | null
          can_edit_info?: boolean | null
          can_send_messages?: boolean | null
          chat_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          muted_until?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          encryption_enabled: boolean | null
          id: string
          invite_link: string | null
          is_public: boolean | null
          max_members: number | null
          name: string | null
          type: Database["public"]["Enums"]["chat_type"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          encryption_enabled?: boolean | null
          id?: string
          invite_link?: string | null
          is_public?: boolean | null
          max_members?: number | null
          name?: string | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          encryption_enabled?: boolean | null
          id?: string
          invite_link?: string | null
          is_public?: boolean | null
          max_members?: number | null
          name?: string | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          encrypted_message_key: string
          id: string
          message_id: string | null
          read_at: string | null
          recipient_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          encrypted_message_key: string
          id?: string
          message_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          encrypted_message_key?: string
          id?: string
          message_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string | null
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          encrypted_content: string
          encryption_key_id: string | null
          file_mime_type: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          reply_to_id: string | null
          sender_id: string | null
          sender_key_fingerprint: string | null
          type: Database["public"]["Enums"]["message_type"] | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          encrypted_content: string
          encryption_key_id?: string | null
          file_mime_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          reply_to_id?: string | null
          sender_id?: string | null
          sender_key_fingerprint?: string | null
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          encrypted_content?: string
          encryption_key_id?: string | null
          file_mime_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          reply_to_id?: string | null
          sender_id?: string | null
          sender_key_fingerprint?: string | null
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_encryption_key_id_fkey"
            columns: ["encryption_key_id"]
            isOneToOne: false
            referencedRelation: "user_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_auth_methods: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          method: Database["public"]["Enums"]["auth_method"]
          method_data: Json
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          method: Database["public"]["Enums"]["auth_method"]
          method_data?: Json
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          method?: Database["public"]["Enums"]["auth_method"]
          method_data?: Json
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_auth_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contacts: {
        Row: {
          contact_id: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_blocked: boolean | null
          is_favorite: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          device_type: Database["public"]["Enums"]["device_type"]
          id: string
          is_trusted: boolean | null
          last_active: string | null
          push_token: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          device_type: Database["public"]["Enums"]["device_type"]
          id?: string
          is_trusted?: boolean | null
          last_active?: string | null
          push_token?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          is_trusted?: boolean | null
          last_active?: string | null
          push_token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_keys: {
        Row: {
          created_at: string | null
          device_id: string
          encrypted_private_key: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_version: number | null
          public_key: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          encrypted_private_key: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_version?: number | null
          public_key: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          encrypted_private_key?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_version?: number | null
          public_key?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          allow_contact_discovery: boolean | null
          anonymous_id: string
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          last_seen: string | null
          updated_at: string | null
          visibility_mode: string | null
        }
        Insert: {
          allow_contact_discovery?: boolean | null
          anonymous_id?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          last_seen?: string | null
          updated_at?: string | null
          visibility_mode?: string | null
        }
        Update: {
          allow_contact_discovery?: boolean | null
          anonymous_id?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_seen?: string | null
          updated_at?: string | null
          visibility_mode?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      auth_method: "email_password" | "passkey" | "wallet_connect"
      chat_type: "direct" | "group" | "channel"
      device_type: "web" | "mobile" | "desktop"
      message_type: "text" | "image" | "file" | "voice" | "video" | "system"
      user_role: "user" | "moderator" | "admin"
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
      auth_method: ["email_password", "passkey", "wallet_connect"],
      chat_type: ["direct", "group", "channel"],
      device_type: ["web", "mobile", "desktop"],
      message_type: ["text", "image", "file", "voice", "video", "system"],
      user_role: ["user", "moderator", "admin"],
    },
  },
} as const
