import type { RestaurantOpenStatus } from "@/src/lib/restaurants/open-status";

export type RestaurantCategoryId =
  | "all"
  | "japanese"
  | "chinese"
  | "snacks"
  | "coffee"
  | "desserts";

export type CategoryFilterItem = {
  id: string;
  label: string;
};

export type Restaurant = {
  id: string;
  name: string;
  imageUrl: string;
  /** Storage object key for the cover; null when using the placeholder. */
  coverPath?: string | null;
  rating: number;
  reviewCount: number;
  /** Google price level 0–4 ($ – $$$$$); null / undefined when unavailable. */
  priceLevel?: number | null;
  isOpen: boolean;
  /** Derived display status for the open-status badge. */
  openStatus?: RestaurantOpenStatus;
  distanceMeters: number;
  averagePrice: number;
  priceMin: number;
  priceMax: number;
  tags: string[];
  /** App category label (e.g. 日式) or legacy mock id. */
  category: string;
  isFavorite: boolean;
  googlePlaceId?: string;
  /** ISO timestamptz from restaurants.last_google_sync_at */
  lastGoogleSyncAt?: string | null;
  lastVisited?: string;
  notes?: string;
};

export type OpeningHours = {
  slots: string[];
  todayStatusLabel: string;
  closedDays: string[];
};

export type HeroImage = {
  id: string;
  url: string;
  alt?: string;
};

export type DiaryRecord = {
  id: string;
  visitDate: string;
  rating: number;
  order: string;
  notes: string;
  photo: string | null;
  /** Author display name from profiles; fallback 「未知成員」. */
  authorName: string;
  /** Ordered food names for timeline chips (display_order ASC). */
  foods?: string[];
  dateTagColor?: "pink" | "yellow" | "green";
  orderHighlightColor?: "pink" | "yellow" | "green";
  washiTape?: "pink" | "khaki";
  photoRotation?: number;
};

export type RestaurantDetail = Restaurant & {
  images: HeroImage[];
  openingHours: OpeningHours;
  phoneNumber?: string;
  address?: string;
  menuImages: string[];
  latitude?: number;
  longitude?: number;
  websiteUrl?: string;
  lastOrder?: string;
  myRating?: number;
  recordCount?: number;
  records?: DiaryRecord[];
};
