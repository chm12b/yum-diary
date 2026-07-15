import { createClient } from "@/src/lib/supabase/client";

import { PHOTO_BUCKET } from "./types";

/**
 * Remove one object from the yum-diary bucket by its object key.
 * Throws on storage errors.
 */
export async function deletePhoto(path: string): Promise<void> {
  const key = path.trim();
  if (!key) {
    throw new Error("Missing storage path");
  }

  const supabase = createClient();
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([key]);

  if (error) {
    throw error;
  }
}
