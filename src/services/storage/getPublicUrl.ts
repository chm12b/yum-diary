import { createClient } from "@/src/lib/supabase/client";

import { PHOTO_BUCKET } from "./types";

/**
 * Resolve the public URL for an object key in the yum-diary bucket.
 * Does not verify the object exists.
 */
export function getPublicUrl(path: string): string {
  const key = path.trim();
  if (!key) {
    throw new Error("Missing storage path");
  }

  const supabase = createClient();
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(key);

  return data.publicUrl;
}
