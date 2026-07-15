/**
 * Image helpers for the storage layer.
 *
 * Foundation only: validation + basic metadata. No compression / conversion.
 */

import { isImageMimeType } from "./mime";

/** True when the blob/file reports an `image/*` MIME type. */
export function isImageFile(file: Blob): boolean {
  return isImageMimeType(file.type);
}

/**
 * Throw when a file declares a non-image MIME type.
 * A blank type (e.g. a raw Blob) is allowed through — it cannot be validated
 * here and the storage content type falls back to webp.
 */
export function assertImageFile(file: Blob): void {
  const type = file.type ?? "";
  if (type !== "" && !isImageMimeType(type)) {
    throw new Error(`Unsupported file type: ${type}`);
  }
}

/**
 * Read intrinsic pixel dimensions of an image blob (browser only).
 * Useful later for cover selection; not used for compression.
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
