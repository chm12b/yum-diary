import { resolveRestaurantCoverUrl } from "@/src/lib/restaurants/cover-url";
import {
  distanceMetersOrZero,
  type GeoPoint,
} from "@/src/lib/restaurants/distance";
import { resolveOpenStatus } from "@/src/lib/restaurants/open-status";
import type { Restaurant } from "@/src/lib/restaurant-types";
import type { RestaurantRecord } from "@/src/services/restaurant";

/**
 * Map a DB restaurant row to the existing list Card model.
 * Distance is computed against the current group's reference point.
 */
export function mapRestaurantRecordToListItem(
  row: RestaurantRecord,
  reference: GeoPoint | null = null,
  isFavorite = false,
): Restaurant {
  const priceMin = row.price_min ?? 0;
  const priceMax = row.price_max ?? priceMin;

  return {
    id: row.id,
    name: row.name,
    imageUrl: resolveRestaurantCoverUrl(
      row.restaurant_cover_path,
      row.updated_at,
    ),
    coverPath: row.restaurant_cover_path ?? null,
    rating: row.google_rating ?? 0,
    reviewCount: row.google_rating_count ?? 0,
    priceLevel: row.price_level ?? null,
    isOpen: false,
    openStatus: resolveOpenStatus(row.business_hours),
    distanceMeters: distanceMetersOrZero(
      { lat: row.latitude, lng: row.longitude },
      reference,
    ),
    averagePrice:
      priceMin > 0 && priceMax > 0
        ? Math.round((priceMin + priceMax) / 2)
        : 0,
    priceMin,
    priceMax,
    tags: [row.category],
    category: row.category,
    isFavorite,
    city: row.city ?? null,
    district: row.district ?? null,
    googlePlaceId: row.google_place_id ?? undefined,
    notes: row.notes ?? undefined,
  };
}
