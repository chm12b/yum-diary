/**
 * Client-side image compression for storage uploads.
 *
 * Uses the Canvas API only (no third-party libs):
 * 1. Decode via createImageBitmap
 * 2. Downscale so the longest edge ≤ 1200px (never upscale)
 * 3. Encode as image/webp @ quality 0.8
 *
 * Specs (`COMPRESS_IMAGE_*` / `fitWithinMaxEdge`) are shared with the
 * one-off migration script `scripts/migratePhotoCompression.ts`.
 */

import { WEBP_MIME_TYPE } from "./mime";

/** Longest edge after resize (px). Smaller images are left unchanged. */
export const COMPRESS_IMAGE_MAX_EDGE_PX = 1200;

/** WebP encoder quality (0–1). ~0.8 keeps detail while cutting iPhone HEIC/JPEG size. */
export const COMPRESS_IMAGE_WEBP_QUALITY = 0.8;

/**
 * Compute target canvas size: fit inside maxEdge while preserving aspect ratio.
 * Never enlarges the image.
 */
export function fitWithinMaxEdge(
  width: number,
  height: number,
  maxEdge: number = COMPRESS_IMAGE_MAX_EDGE_PX,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest <= 0) {
    return { width, height };
  }

  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Compress and convert an image blob to WebP for Supabase Storage upload.
 *
 * @throws when createImageBitmap / canvas / WebP encoding is unavailable
 */
export async function compressImage(file: Blob): Promise<Blob> {
  if (typeof createImageBitmap !== "function") {
    throw new Error("createImageBitmap is not available in this environment");
  }
  if (typeof document === "undefined") {
    throw new Error("Canvas compression requires a browser environment");
  }

  const bitmap = await createImageBitmap(file);

  try {
    const { width, height } = fitWithinMaxEdge(
      bitmap.width,
      bitmap.height,
      COMPRESS_IMAGE_MAX_EDGE_PX,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to acquire canvas 2d context");
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        resolve,
        WEBP_MIME_TYPE,
        COMPRESS_IMAGE_WEBP_QUALITY,
      );
    });

    if (!blob) {
      throw new Error(
        "Failed to encode image as WebP (toBlob returned null)",
      );
    }

    return blob;
  } finally {
    bitmap.close();
  }
}
