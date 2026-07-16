import { getPublicUrl } from "@/src/services/storage";

import type { MenuPhoto, MenuPhotoRecord } from "./types";

/** Map a DB row to the UI menu photo model, resolving its public URL. */
export function toMenuPhoto(row: MenuPhotoRecord): MenuPhoto {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    storagePath: row.storage_path,
    page: row.page,
    url: getPublicUrl(row.storage_path),
    createdAt: row.created_at,
  };
}
