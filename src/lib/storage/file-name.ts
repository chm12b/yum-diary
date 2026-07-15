/**
 * Storage path + file-name builders for the single `yum-diary` bucket.
 *
 * Folders are virtual prefixes within the bucket. Names are deterministic
 * (no timestamps, no original file names) so a given slot always maps to the
 * same object key.
 */

export const STORAGE_FOLDERS = {
  restaurants: "restaurants",
  records: "records",
  menus: "menus",
  // Reserved for future use — not implemented in this phase.
  avatars: "avatars",
  groups: "groups",
} as const;

export type StorageFolder =
  (typeof STORAGE_FOLDERS)[keyof typeof STORAGE_FOLDERS];

/** All object names use this extension to keep naming consistent. */
export const DEFAULT_IMAGE_EXTENSION = "webp";

function requireId(value: string, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new Error(`Missing required id: ${field}`);
  }
  return trimmed;
}

/** Zero-pad a 1-based index to two digits (1 → "01", 12 → "12"). */
export function padPhotoIndex(index: number): string {
  if (!Number.isInteger(index) || index < 1) {
    throw new Error(`Invalid photo index: ${index}`);
  }
  return String(index).padStart(2, "0");
}

// --- Restaurant -------------------------------------------------------------

export function restaurantFolder(restaurantId: string): string {
  return `${STORAGE_FOLDERS.restaurants}/${requireId(restaurantId, "restaurantId")}`;
}

/** restaurants/{restaurantId}/cover.webp */
export function restaurantCoverPath(restaurantId: string): string {
  return `${restaurantFolder(restaurantId)}/cover.${DEFAULT_IMAGE_EXTENSION}`;
}

/** restaurants/{restaurantId}/photo-01.webp */
export function restaurantPhotoPath(
  restaurantId: string,
  index: number,
): string {
  return `${restaurantFolder(restaurantId)}/photo-${padPhotoIndex(index)}.${DEFAULT_IMAGE_EXTENSION}`;
}

// --- Diary / records --------------------------------------------------------

export function recordFolder(recordId: string): string {
  return `${STORAGE_FOLDERS.records}/${requireId(recordId, "recordId")}`;
}

/** records/{recordId}/photo-01.webp */
export function diaryPhotoPath(recordId: string, index: number): string {
  return `${recordFolder(recordId)}/photo-${padPhotoIndex(index)}.${DEFAULT_IMAGE_EXTENSION}`;
}

// --- Menu -------------------------------------------------------------------

export function menuFolder(restaurantId: string): string {
  return `${STORAGE_FOLDERS.menus}/${requireId(restaurantId, "restaurantId")}`;
}

/** menus/{restaurantId}/menu-01.webp */
export function menuPhotoPath(restaurantId: string, index: number): string {
  return `${menuFolder(restaurantId)}/menu-${padPhotoIndex(index)}.${DEFAULT_IMAGE_EXTENSION}`;
}
