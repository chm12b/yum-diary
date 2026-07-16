import type { Database, Json } from "@/src/types/database";

/** Persisted / form business hours shape (matches DATABASE.md). */
export type BusinessHoursInput = {
  periods: Array<{
    open: string;
    close: string;
  }>;
  closedDays: string[];
  openAllYear?: boolean;
  irregularHolidays?: boolean;
};

export type CreateRestaurantInput = {
  groupId: string;
  name: string;
  category: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  businessHours?: BusinessHoursInput | null;
  note?: string | null;
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleRatingCount?: number | null;
  priceLevel?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type RestaurantRecord =
  Database["public"]["Tables"]["restaurants"]["Row"];

export type RestaurantInsert =
  Database["public"]["Tables"]["restaurants"]["Insert"];

export type { Json };
