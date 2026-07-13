import type { Restaurant } from "@/src/lib/restaurant-types";
import type { RestaurantRecord } from "@/src/services/restaurant";

/**
 * Map a DB restaurant row to the existing list Card model.
 * Fields not yet backed by List data use safe defaults (Card UI unchanged).
 */
export function mapRestaurantRecordToListItem(
  row: RestaurantRecord,
): Restaurant {
  const priceMin = row.price_min ?? 0;
  const priceMax = row.price_max ?? priceMin;

  return {
    id: row.id,
    name: row.name,
    imageUrl: "/restaurants/placeholder.svg",
    rating: 0,
    reviewCount: 0,
    isOpen: false,
    distanceMeters: 0,
    averagePrice:
      priceMin > 0 && priceMax > 0
        ? Math.round((priceMin + priceMax) / 2)
        : 0,
    priceMin,
    priceMax,
    tags: [row.category],
    category: row.category,
    isFavorite: false,
    googlePlaceId: row.google_place_id ?? undefined,
    notes: row.notes ?? undefined,
  };
}
