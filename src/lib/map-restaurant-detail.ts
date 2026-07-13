import { parseOpeningHours } from "@/src/lib/restaurants/business-hours";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";
import type { RestaurantRecord } from "@/src/services/restaurant";

const PLACEHOLDER_IMAGE = "/restaurants/placeholder.svg";

/**
 * Map a DB restaurant row to the existing Detail UI model.
 * Photos / menu / diary are placeholders until those features ship.
 */
export function mapRestaurantRecordToDetail(
  row: RestaurantRecord,
): RestaurantDetail {
  const priceMin = row.price_min ?? 0;
  const priceMax = row.price_max ?? priceMin;

  return {
    id: row.id,
    name: row.name,
    imageUrl: PLACEHOLDER_IMAGE,
    images: [
      {
        id: `${row.id}-placeholder`,
        url: PLACEHOLDER_IMAGE,
        alt: row.name,
      },
    ],
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
    openingHours: parseOpeningHours(row.business_hours),
    phoneNumber: row.phone ?? undefined,
    address: row.address ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    menuImages: [],
    recordCount: 0,
    records: [],
  };
}
