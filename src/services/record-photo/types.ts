import type { Database } from "@/src/types/database";

export type RecordPhotoRow =
  Database["public"]["Tables"]["record_photos"]["Row"];

export type RecordPhotoInsert =
  Database["public"]["Tables"]["record_photos"]["Insert"];

/** UI-facing diary photo (camelCase + resolved public URL). */
export type RecordPhoto = {
  id: string;
  recordId: string;
  storagePath: string;
  photoOrder: number;
  url: string;
  createdAt: string;
};

export type UploadRecordPhotoInput = {
  recordId: string;
  file: File | Blob;
};

export type DeleteRecordPhotoInput = {
  id: string;
  storagePath: string;
};

/** Max diary photos per record for the MVP. */
export const RECORD_PHOTOS_MAX = 10;
