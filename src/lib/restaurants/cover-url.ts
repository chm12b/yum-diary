import { getPublicUrl } from "@/src/services/storage";

export const RESTAURANT_COVER_PLACEHOLDER = "/restaurants/placeholder.svg";

/**
 * Resolve a display URL for a restaurant cover Storage path.
 * Pass `cacheKey` (e.g. `updated_at`) so overwrites bust CDN / browser cache
 * while the object key stays `cover.webp`.
 */
export function resolveRestaurantCoverUrl(
  coverPath: string | null | undefined,
  cacheKey?: string | null,
): string {
  const path = coverPath?.trim() ?? "";
  if (!path) {
    return RESTAURANT_COVER_PLACEHOLDER;
  }

  const url = getPublicUrl(path);
  if (!cacheKey) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${encodeURIComponent(cacheKey)}`;
}

export function hasRestaurantCover(
  coverPath: string | null | undefined,
): boolean {
  return Boolean(coverPath?.trim());
}
