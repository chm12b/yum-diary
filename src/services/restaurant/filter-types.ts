import type { RestaurantOpenStatus } from "@/src/lib/restaurants/open-status";
import type { GeoPoint } from "@/src/lib/restaurants/distance";

/**
 * Restaurant List filter (data layer).
 * openStatus is applied via existing resolveOpenStatus(business_hours).
 * Unknown open status is always included when openStatus is set.
 */
export type RestaurantFilter = {
  city?: string;
  district?: string;
  category?: string;
  openStatus?: RestaurantOpenStatus;
  /** Keep restaurants within this distance of referencePoint (meters). */
  maxDistanceMeters?: number;
};

export type RestaurantSort =
  | "distance"
  | "newest"
  | "name"
  | "rating_desc"
  | "rating_asc";

export const DEFAULT_RESTAURANT_SORT: RestaurantSort = "distance";

/** Options for listRestaurants (object form). */
export type ListRestaurantsInput = {
  groupId: string;
  filter?: RestaurantFilter;
  /** Defaults to "distance" for object-form calls. */
  sort?: RestaurantSort;
  /** Matches name / address / city / district (case-insensitive). */
  search?: string;
  /** Required for meaningful distance sort; falls back to newest when missing. */
  referencePoint?: GeoPoint | null;
};
