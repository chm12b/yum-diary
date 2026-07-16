import { createClient } from "@/src/lib/supabase/client";

import { toRecordPhoto } from "./map";
import type { RecordPhoto } from "./types";

/**
 * List a diary record's photos (album order: photo_order ASC, then created_at).
 * Returns [] when the id is blank.
 */
export async function listRecordPhotos(
  recordId: string,
): Promise<RecordPhoto[]> {
  const id = recordId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("record_photos")
    .select("*")
    .eq("record_id", id)
    .order("photo_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toRecordPhoto);
}
