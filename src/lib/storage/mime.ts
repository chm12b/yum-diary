/**
 * MIME type helpers for Yum Diary storage.
 * Centralizes which image types are accepted and the canonical webp type.
 */

/** Canonical image type stored by the app (naming convention uses .webp). */
export const WEBP_MIME_TYPE = "image/webp";

/** Image MIME types the storage layer accepts as an upload source. */
export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

export type SupportedImageMimeType =
  (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

/** True when the value is one of the explicitly supported image types. */
export function isSupportedImageMimeType(
  mime: string | null | undefined,
): mime is SupportedImageMimeType {
  if (!mime) {
    return false;
  }
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

/** True for any `image/*` MIME type. */
export function isImageMimeType(mime: string | null | undefined): boolean {
  return typeof mime === "string" && mime.startsWith("image/");
}
