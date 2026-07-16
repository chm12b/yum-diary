import { getPublicUrl } from "@/src/services/storage";

import type { RecordPhoto, RecordPhotoRow } from "./types";

/** Map a DB row to the UI diary photo model, resolving its public URL. */
export function toRecordPhoto(row: RecordPhotoRow): RecordPhoto {
  return {
    id: row.id,
    recordId: row.record_id,
    storagePath: row.storage_path,
    photoOrder: row.photo_order,
    url: getPublicUrl(row.storage_path),
    createdAt: row.created_at,
  };
}
