import { listFavorites } from "@/src/services/favorite";
import { getCurrentGroup } from "@/src/services/groups/group.service";
import {
  listRestaurants,
  type RestaurantRecord,
} from "@/src/services/restaurant";
import { mapRestaurantRecordToListItem } from "@/src/lib/map-restaurant-list-item";
import type { AppCategory } from "@/src/lib/restaurants/category";
import {
  distanceMetersOrZero,
  type GeoPoint,
} from "@/src/lib/restaurants/distance";
import { resolveOpenStatus } from "@/src/lib/restaurants/open-status";
import type { Restaurant } from "@/src/lib/restaurant-types";

export type DecideDistanceKm = 1 | 3 | 5 | null;
export type DecideFavoriteMode = "all" | "favorites";

export type DecideFilters = {
  onlyOpen: boolean;
  /** Exact city match; null means any. */
  city: string | null;
  /** Exact district match; null means any. Requires city when set. */
  district: string | null;
  maxDistanceKm: DecideDistanceKm;
  favoriteMode: DecideFavoriteMode;
  selectedCategories: AppCategory[];
};

export type DecideCandidate = {
  restaurant: Restaurant;
  message: string;
};

function hasCoordinates(
  row: RestaurantRecord,
): row is RestaurantRecord & { latitude: number; longitude: number } {
  return row.latitude != null && row.longitude != null;
}

function randomItem<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function createBunnyMessage(
  restaurant: Restaurant,
  filters: DecideFilters,
): string {
  const messages = [
    "今天附近有好多好吃的，就決定這家吧 ❤️",
    "今天換個口味試試看吧！",
    "兔兔幫你選好了，出發吃飯吧！",
  ];

  if (restaurant.distanceMeters > 0 && restaurant.distanceMeters <= 1000) {
    messages.push("離你很近，走路一下就到了！");
  }

  if (filters.favoriteMode === "favorites") {
    messages.push("從你的收藏裡挑到了這家，今天就再去回味吧 ❤️");
  }

  if (filters.selectedCategories.length === 1) {
    messages.push(
      `今天就吃${filters.selectedCategories[0]}，換個好心情！`,
    );
  } else if (filters.selectedCategories.length > 1) {
    messages.push("今天從你選的分類裡挑好了！");
  }

  return randomItem(messages);
}

/**
 * Filter restaurants from the current group, then return one random candidate.
 * All candidate filtering and random selection live in this service.
 */
export async function getDecideCandidates(
  filters: DecideFilters,
): Promise<DecideCandidate | null> {
  const favoritePromise =
    filters.favoriteMode === "favorites"
      ? listFavorites()
      : Promise.resolve([]);

  const groupResult = await getCurrentGroup();

  if (groupResult.error) {
    throw groupResult.error;
  }

  const groupId = groupResult.data?.id;
  if (!groupId) {
    return null;
  }

  const [rows, favorites] = await Promise.all([
    listRestaurants(groupId),
    favoritePromise,
  ]);

  const reference: GeoPoint | null =
    groupResult.data?.referenceLat != null &&
    groupResult.data.referenceLng != null
      ? {
          lat: groupResult.data.referenceLat,
          lng: groupResult.data.referenceLng,
        }
      : null;
  const favoriteIds = new Set(
    favorites.map((favorite) => favorite.restaurantId),
  );

  let candidates = rows;

  if (filters.onlyOpen) {
    candidates = candidates.filter((row) => {
      const status = resolveOpenStatus(row.business_hours);
      return status !== "closed" && status !== "holiday";
    });
  }

  const city = filters.city?.trim() || null;
  if (city) {
    candidates = candidates.filter((row) => row.city?.trim() === city);
  }

  const district = filters.district?.trim() || null;
  if (district) {
    candidates = candidates.filter((row) => row.district?.trim() === district);
  }

  if (filters.maxDistanceKm != null && reference) {
    const maxDistanceMeters = filters.maxDistanceKm * 1000;
    candidates = candidates.filter(
      (row) =>
        hasCoordinates(row) &&
        distanceMetersOrZero(
          { lat: row.latitude, lng: row.longitude },
          reference,
        ) <= maxDistanceMeters,
    );
  }

  if (filters.selectedCategories.length > 0) {
    const selected = new Set<string>(filters.selectedCategories);
    candidates = candidates.filter(
      (row) => row.category != null && selected.has(row.category),
    );
  }

  if (filters.favoriteMode === "favorites") {
    candidates = candidates.filter((row) => favoriteIds.has(row.id));
  }

  if (candidates.length === 0) {
    return null;
  }

  const selectedRestaurant = randomItem(candidates);
  const restaurant = mapRestaurantRecordToListItem(
    selectedRestaurant,
    reference,
    favoriteIds.has(selectedRestaurant.id),
  );

  return {
    restaurant,
    message: createBunnyMessage(restaurant, filters),
  };
}
