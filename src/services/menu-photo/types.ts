import type { Database } from "@/src/types/database";

export type MenuPhotoRecord =
  Database["public"]["Tables"]["menu_photos"]["Row"];

export type MenuPhotoInsert =
  Database["public"]["Tables"]["menu_photos"]["Insert"];

/** UI-facing menu photo (camelCase + resolved public URL). */
export type MenuPhoto = {
  id: string;
  restaurantId: string;
  storagePath: string;
  page: number;
  url: string;
  createdAt: string;
};

export type UploadMenuPhotoInput = {
  restaurantId: string;
  file: File | Blob;
};

export type DeleteMenuPhotoInput = {
  id: string;
  storagePath: string;
};

/** Max menu photos per restaurant for the MVP. */
export const MENU_PHOTOS_MAX = 10;
