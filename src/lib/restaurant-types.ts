export type RestaurantCategoryId =
  | "all"
  | "japanese"
  | "chinese"
  | "snacks"
  | "coffee"
  | "desserts";

export type CategoryFilterItem = {
  id: RestaurantCategoryId;
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
  category: Exclude<RestaurantCategoryId, "all">;
  isFavorite: boolean;
  googlePlaceId?: string;
  lastVisited?: string;
  notes?: string;
};

export type OpeningHours = {
  slots: string[];
  todayStatusLabel: string;
};

export type HeroImage = {
  id: string;
  url: string;
  alt?: string;
};

export type RestaurantDetail = Restaurant & {
  images: HeroImage[];
  openingHours: OpeningHours;
  phoneNumber?: string;
  address?: string;
  menuImages: string[];
  latitude?: number;
  longitude?: number;
  lastOrder?: string;
  myRating?: number;
};
