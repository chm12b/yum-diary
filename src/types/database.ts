export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          current_group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          current_group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          current_group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          owner_id: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          owner_id: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          owner_id?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          name: string;
          category: string;
          phone: string | null;
          address: string | null;
          website_url: string | null;
          notes: string | null;
          latitude: number | null;
          longitude: number | null;
          price_min: number | null;
          price_max: number | null;
          google_place_id: string | null;
          business_hours: Json | null;
          last_google_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          name: string;
          category: string;
          phone?: string | null;
          address?: string | null;
          website_url?: string | null;
          notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          price_min?: number | null;
          price_max?: number | null;
          google_place_id?: string | null;
          business_hours?: Json | null;
          last_google_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          name?: string;
          category?: string;
          phone?: string | null;
          address?: string | null;
          website_url?: string | null;
          notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          price_min?: number | null;
          price_max?: number | null;
          google_place_id?: string | null;
          business_hours?: Json | null;
          last_google_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_group: {
        Args: {
          p_group_name: string;
          p_invite_code: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
