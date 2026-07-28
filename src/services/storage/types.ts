/**
 * Types for the Yum Diary storage service.
 * A single public bucket backs Restaurant / Diary / Menu images.
 */

/** The one and only storage bucket. */
export type PhotoBucket = "yum-diary";

export const PHOTO_BUCKET: PhotoBucket = "yum-diary";

export type UploadOptions = {
  /** Content type to store the object as. Defaults to image/webp. */
  contentType?: string;
  /** Overwrite an existing object at the same path. Defaults to true. */
  upsert?: boolean;
  /** Cache-Control max-age in seconds. Defaults to "31536000" (1 year). */
  cacheControl?: string;
};

export type UploadResult = {
  /** Object key within the bucket (no bucket prefix). */
  path: string;
  /** Public URL for the stored object. */
  publicUrl: string;
};

export type UploadRestaurantPhotoParams = {
  restaurantId: string;
  file: File | Blob;
  /** "cover" → cover.webp; a 1-based number → photo-01.webp */
  slot: "cover" | number;
};

export type UploadDiaryPhotoParams = {
  recordId: string;
  file: File | Blob;
  /** 1-based index → photo-01.webp */
  index: number;
};

export type UploadMenuPhotoParams = {
  restaurantId: string;
  file: File | Blob;
  /** 1-based index → menu-01.webp */
  index: number;
};
