import { createClient } from "@/src/lib/supabase/client";
import { uploadMenuPhoto as uploadMenuPhotoToStorage } from "@/src/services/storage";

import { listMenuPhotos } from "./listMenuPhotos";
import { toMenuPhoto } from "./map";
import {
  MENU_PHOTOS_MAX,
  type MenuPhoto,
  type MenuPhotoInsert,
  type UploadMenuPhotoInput,
} from "./types";

/**
 * Upload a menu photo to Storage, then persist a menu_photos row.
 *
 * - Enforces the per-restaurant max.
 * - Picks the lowest free `page` so deleted slots are reused and existing
 *   files are never overwritten.
 * Throws on validation / auth / storage / database errors.
 */
export async function uploadMenuPhoto(
  input: UploadMenuPhotoInput,
): Promise<MenuPhoto> {
  const restaurantId = input.restaurantId?.trim() ?? "";
  if (!restaurantId) {
    throw new Error("Missing required field: restaurantId");
  }
  if (!input.file) {
    throw new Error("Missing required field: file");
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Not authenticated");
  }

  const existing = await listMenuPhotos(restaurantId);

  if (existing.length >= MENU_PHOTOS_MAX) {
    throw new Error(`最多只能上傳 ${MENU_PHOTOS_MAX} 張菜單`);
  }

  const usedPages = new Set(existing.map((photo) => photo.page));
  let page = 1;
  while (usedPages.has(page)) {
    page += 1;
  }

  const contentType = input.file.type || undefined;
  const { path } = await uploadMenuPhotoToStorage(
    {
      restaurantId,
      file: input.file,
      index: page,
    },
    contentType ? { contentType } : undefined,
  );

  const row: MenuPhotoInsert = {
    restaurant_id: restaurantId,
    storage_path: path,
    page,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("menu_photos")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create menu photo");
  }

  return toMenuPhoto(data);
}
