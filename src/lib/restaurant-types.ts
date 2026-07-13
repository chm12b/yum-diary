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
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  distanceMeters: number;
  averagePrice: number;
  priceMin: number;
  priceMax: number;
  tags: string[];
  /** App category label (e.g. 日式) or legacy mock id. */
  category: string;
  isFavorite: boolean;
  googlePlaceId?: string;
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
  photo: string;
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
