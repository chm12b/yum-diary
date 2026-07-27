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
          reference_name: string | null;
          reference_lat: number | null;
          reference_lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          owner_id: string;
          is_archived?: boolean;
          reference_name?: string | null;
          reference_lat?: number | null;
          reference_lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          owner_id?: string;
          is_archived?: boolean;
          reference_name?: string | null;
          reference_lat?: number | null;
          reference_lng?: number | null;
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
          city: string | null;
          district: string | null;
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
          archived_at: string | null;
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
          city?: string | null;
          district?: string | null;
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
          archived_at?: string | null;
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
          city?: string | null;
          district?: string | null;
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
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_favorites: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      restaurant_photos: {
        Row: {
          id: string;
          restaurant_id: string;
          storage_path: string;
          caption: string | null;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          storage_path: string;
          caption?: string | null;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          storage_path?: string;
          caption?: string | null;
          is_cover?: boolean;
          created_at?: string;
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
          group_order_id: string | null;
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
          group_order_id?: string | null;
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
          group_order_id?: string | null;
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
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category: string;
          name: string;
          price: number | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category: string;
          name: string;
          price?: number | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category?: string;
          name?: string;
          price?: number | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      group_orders: {
        Row: {
          id: string;
          group_id: string;
          restaurant_id: string;
          title: string;
          description: string | null;
          status: string;
          close_at: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          group_id: string;
          restaurant_id: string;
          title: string;
          description?: string | null;
          status?: string;
          close_at: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          group_id?: string;
          restaurant_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          close_at?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      group_order_participants: {
        Row: {
          id: string;
          group_order_id: string;
          user_id: string;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_order_id: string;
          user_id: string;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_order_id?: string;
          user_id?: string;
          joined_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      group_order_items: {
        Row: {
          id: string;
          participant_id: string;
          menu_item_id: string;
          quantity: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          menu_item_id: string;
          quantity?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          menu_item_id?: string;
          quantity?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
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
      leave_group: {
        Args: {
          p_group_id: string;
        };
        Returns: string | null;
      };
      hard_delete_group: {
        Args: {
          p_group_id: string;
          p_dry_run: boolean;
        };
        Returns: string | null;
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
