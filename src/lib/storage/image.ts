/**
 * Image helpers for the storage layer.
 *
 * Validation + metadata live here. Compression / WebP conversion is in
 * `compressImage.ts` and is applied by `uploadPhoto`.
 */

import { isImageMimeType } from "./mime";

/** True when the blob/file reports an `image/*` MIME type. */
export function isImageFile(file: Blob): boolean {
  return isImageMimeType(file.type);
}

/**
 * Throw when a file declares a non-image MIME type.
 * A blank type (e.g. a raw Blob) is allowed through — it cannot be validated
 * here and compression still produces WebP for storage.
 */
export function assertImageFile(file: Blob): void {
  const type = file.type ?? "";
  if (type !== "" && !isImageMimeType(type)) {
    throw new Error(`Unsupported file type: ${type}`);
  }
}

/**
 * Read intrinsic pixel dimensions of an image blob (browser only).
 * Useful for cover selection / UI previews; compression uses createImageBitmap
 * independently inside compressImage().
 */
export async function getImageDimensions(
  file: Blob,
): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap !== "function") {
    throw new Error("createImageBitmap is not available in this environment");
  }

  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}
