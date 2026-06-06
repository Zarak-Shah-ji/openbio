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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          created_at: string
          id: string
          link_id: string | null
          referrer: string | null
          type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_id?: string | null
          referrer?: string | null
          type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_id?: string | null
          referrer?: string | null
          type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_featured: boolean
          position: number
          thumbnail_url: string | null
          title: string
          url: string
          user_id: string
          visible_from: string | null
          visible_until: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          position?: number
          thumbnail_url?: string | null
          title: string
          url: string
          user_id: string
          visible_from?: string | null
          visible_until?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          position?: number
          thumbnail_url?: string | null
          title?: string
          url?: string
          user_id?: string
          visible_from?: string | null
          visible_until?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          seo_description: string | null
          seo_title: string | null
          theme: Json
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          seo_description?: string | null
          seo_title?: string | null
          theme?: Json
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          seo_description?: string | null
          seo_title?: string | null
          theme?: Json
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      capture_lead: {
        Args: { p_email: string; p_username: string }
        Returns: undefined
      }
      record_event: {
        Args: {
          p_link_id?: string
          p_referrer?: string
          p_type: string
          p_user_agent?: string
          p_username?: string
        }
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
