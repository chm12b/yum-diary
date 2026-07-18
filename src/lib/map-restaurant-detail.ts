import { parseOpeningHours } from "@/src/lib/restaurants/business-hours";
import {
  hasRestaurantCover,
  resolveRestaurantCoverUrl,
} from "@/src/lib/restaurants/cover-url";
import {
  distanceMetersOrZero,
  type GeoPoint,
} from "@/src/lib/restaurants/distance";
import { resolveOpenStatus } from "@/src/lib/restaurants/open-status";
import type { DiaryRecord, RestaurantDetail } from "@/src/lib/restaurant-types";
import type { DiningRecord } from "@/src/services/record";
import type { RestaurantRecord } from "@/src/services/restaurant";

const UNKNOWN_MEMBER_LABEL = "未知成員";

function resolveAuthorName(
  authorNames: Map<string, string>,
  userId: string,
): string {
  const name = authorNames.get(userId)?.trim() ?? "";
  return name || UNKNOWN_MEMBER_LABEL;
}

function mapDiningRecordToDiary(
  row: DiningRecord,
  photoUrl: string | null = null,
  authorName: string = UNKNOWN_MEMBER_LABEL,
): DiaryRecord {
  return {
    id: row.id,
    visitDate: row.visit_date,
    rating: row.rating,
    order: "",
    notes: row.notes,
    photo: photoUrl,
    authorName,
  };
}

/**
 * Map a DB restaurant row to the existing Detail UI model.
 * Cover comes from `restaurant_cover_path`; menu is loaded separately.
 */
export function mapRestaurantRecordToDetail(
  row: RestaurantRecord,
  diningRecords: DiningRecord[] = [],
  reference: GeoPoint | null = null,
  firstPhotoUrls: Map<string, string> = new Map(),
  authorNames: Map<string, string> = new Map(),
  isFavorite = false,
): RestaurantDetail {
  const priceMin = row.price_min ?? 0;
  const priceMax = row.price_max ?? priceMin;
  const records = diningRecords.map((record) =>
    mapDiningRecordToDiary(
      record,
      firstPhotoUrls.get(record.id) ?? null,
      resolveAuthorName(authorNames, record.user_id),
    ),
  );
  const latest = records[0];
  const coverPath = row.restaurant_cover_path;
  const imageUrl = resolveRestaurantCoverUrl(coverPath, row.updated_at);
  const hasCover = hasRestaurantCover(coverPath);

  return {
    id: row.id,
    name: row.name,
    imageUrl,
    coverPath: coverPath ?? null,
    images: [
      {
        id: hasCover ? `${row.id}-cover` : `${row.id}-placeholder`,
        url: imageUrl,
        alt: row.name,
      },
    ],
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
    googlePlaceId: row.google_place_id ?? undefined,
    lastGoogleSyncAt: row.last_google_sync_at,
    notes: row.notes ?? undefined,
    openingHours: parseOpeningHours(row.business_hours),
    phoneNumber: row.phone ?? undefined,
    address: row.address ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    menuImages: [],
    lastVisited: latest?.visitDate,
    myRating: latest?.rating,
    recordCount: records.length,
    records,
  };
}
