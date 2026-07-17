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
          reference_name: string;
          reference_lat: number;
          reference_lng: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          owner_id: string;
          is_archived?: boolean;
          reference_name?: string;
          reference_lat?: number;
          reference_lng?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          owner_id?: string;
          is_archived?: boolean;
          reference_name?: string;
          reference_lat?: number;
          reference_lng?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          profile_id: string;
          role: string;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          profile_id: string;
          role: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          profile_id?: string;
          role?: string;
          joined_at?: string;
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
          google_photo_reference: string | null;
          google_rating: number | null;
          google_rating_count: number | null;
          price_level: number | null;
          business_hours: Json | null;
          last_google_sync_at: string | null;
          restaurant_cover_path: string | null;
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
          google_photo_reference?: string | null;
          google_rating?: number | null;
          google_rating_count?: number | null;
          price_level?: number | null;
          business_hours?: Json | null;
          last_google_sync_at?: string | null;
          restaurant_cover_path?: string | null;
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
          google_photo_reference?: string | null;
          google_rating?: number | null;
          google_rating_count?: number | null;
          price_level?: number | null;
          business_hours?: Json | null;
          last_google_sync_at?: string | null;
          restaurant_cover_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      records: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          visit_date: string;
          rating: number;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          visit_date: string;
          rating: number;
          notes: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          visit_date?: string;
          rating?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_photos: {
        Row: {
          id: string;
          restaurant_id: string;
          storage_path: string;
          page: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          storage_path: string;
          page?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          storage_path?: string;
          page?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      record_photos: {
        Row: {
          id: string;
          record_id: string;
          storage_path: string;
          photo_order: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          record_id: string;
          storage_path: string;
          photo_order?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          record_id?: string;
          storage_path?: string;
          photo_order?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      record_foods: {
        Row: {
          id: string;
          record_id: string;
          name: string;
          display_order: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          record_id: string;
          name: string;
          display_order?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          record_id?: string;
          name?: string;
          display_order?: number;
          created_by?: string | null;
          created_at?: string;
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
      get_invite_preview: {
        Args: {
          p_invite_code: string;
        };
        Returns: {
          group_id: string;
          group_name: string;
          owner_name: string;
        }[];
      };
      join_group: {
        Args: {
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
