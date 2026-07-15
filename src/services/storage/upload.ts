import { createClient } from "@/src/lib/supabase/client";
import { assertImageFile } from "@/src/lib/storage/image";
import { WEBP_MIME_TYPE } from "@/src/lib/storage/mime";

import { getPublicUrl } from "./getPublicUrl";
import { PHOTO_BUCKET, type UploadOptions, type UploadResult } from "./types";

/**
 * Internal core upload. All storage writes funnel through here so bucket,
 * defaults, and error handling stay consistent.
 */
export async function uploadPhoto(
  path: string,
  file: File | Blob,
  options?: UploadOptions,
): Promise<UploadResult> {
  assertImageFile(file);

  const supabase = createClient();
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(
    path,
    file,
    {
      contentType: options?.contentType ?? WEBP_MIME_TYPE,
      upsert: options?.upsert ?? true,
      cacheControl: options?.cacheControl ?? "3600",
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
