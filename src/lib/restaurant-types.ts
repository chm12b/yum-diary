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
  category: Exclude<RestaurantCategoryId, "all">;
  isFavorite: boolean;
  googlePlaceId?: string;
  lastVisited?: string;
  notes?: string;
};
