import { createClient } from "@/src/lib/supabase/client";
import { compressImage } from "@/src/lib/storage/compressImage";
import { assertImageFile } from "@/src/lib/storage/image";
import { WEBP_MIME_TYPE } from "@/src/lib/storage/mime";

import { getPublicUrl } from "./getPublicUrl";
import { PHOTO_BUCKET, type UploadOptions, type UploadResult } from "./types";

/**
 * Internal core upload. All storage writes funnel through here so bucket,
 * defaults, and error handling stay consistent.
 *
 * Always compresses + converts to WebP before upload (longest edge ≤ 1200px).
 */
export async function uploadPhoto(
  path: string,
  file: File | Blob,
  options?: UploadOptions,
): Promise<UploadResult> {
  assertImageFile(file);

  const compressed = await compressImage(file);

  const supabase = createClient();
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(
    path,
    compressed,
    {
      contentType: WEBP_MIME_TYPE,
      upsert: options?.upsert ?? true,
      cacheControl: options?.cacheControl ?? "31536000",
    },
  );

  if (error) {
    throw error;
  }

  return {
    path,
    publicUrl: getPublicUrl(path),
  };
}
