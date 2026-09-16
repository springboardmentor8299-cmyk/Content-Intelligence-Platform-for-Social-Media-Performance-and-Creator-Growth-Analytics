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
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'creator' | 'agency' | 'marketing_team' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'creator' | 'agency' | 'marketing_team' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'creator' | 'agency' | 'marketing_team' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          id: string
          user_id: string
          platform: string
          platform_user_id: string | null
          username: string
          access_token: string | null
          refresh_token: string | null
          followers_count: number
          is_connected: boolean
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          platform_user_id?: string | null
          username: string
          access_token?: string | null
          refresh_token?: string | null
          followers_count?: number
          is_connected?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          platform_user_id?: string | null
          username?: string
          access_token?: string | null
          refresh_token?: string | null
          followers_count?: number
          is_connected?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          id: string
          user_id: string
          platform: string
          platform_content_id: string | null
          title: string
          content_type: string
          url: string | null
          thumbnail_url: string | null
          views_count: number
          likes_count: number
          comments_count: number
          shares_count: number
          engagement_rate: number
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          platform_content_id?: string | null
          title: string
          content_type: string
          url?: string | null
          thumbnail_url?: string | null
          views_count?: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          engagement_rate?: number
          published_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          platform_content_id?: string | null
          title?: string
          content_type?: string
          url?: string | null
          thumbnail_url?: string | null
          views_count?: number
          likes_count?: number
          comments_count?: number
          shares_count?: number
          engagement_rate?: number
          published_at?: string
          created_at?: string
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
      user_role: 'creator' | 'agency' | 'marketing_team' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
