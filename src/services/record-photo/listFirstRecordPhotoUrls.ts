import { createClient } from "@/src/lib/supabase/client";
import { getPublicUrl } from "@/src/services/storage";

/**
 * Return the public URL of each record's first photo (lowest photo_order).
 * Records without photos are omitted from the map.
 */
export async function listFirstRecordPhotoUrls(
  recordIds: string[],
): Promise<Map<string, string>> {
  const ids = [...new Set(recordIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return new Map();
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("record_photos")
    .select("record_id, storage_path, photo_order, created_at")
    .in("record_id", ids);

  if (error) {
    throw error;
  }

  const rows = [...(data ?? [])].sort((a, b) => {
    if (a.record_id !== b.record_id) {
      return a.record_id.localeCompare(b.record_id);
    }
    if (a.photo_order !== b.photo_order) {
      return a.photo_order - b.photo_order;
    }
    return a.created_at.localeCompare(b.created_at);
  });

  const map = new Map<string, string>();
  for (const row of rows) {
    if (!map.has(row.record_id)) {
      map.set(row.record_id, getPublicUrl(row.storage_path));
    }
  }

  return map;
}

/**
 * Return the first photo URL for a single record, or null when none exists.
 */
export async function getFirstRecordPhotoUrl(
  recordId: string,
): Promise<string | null> {
  const id = recordId.trim();
  if (!id) {
    return null;
  }

  const map = await listFirstRecordPhotoUrls([id]);
  return map.get(id) ?? null;
}
