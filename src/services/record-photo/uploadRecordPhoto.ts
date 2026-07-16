import { createClient } from "@/src/lib/supabase/client";
import { uploadDiaryPhoto } from "@/src/services/storage";

import { listRecordPhotos } from "./listRecordPhotos";
import { toRecordPhoto } from "./map";
import {
  RECORD_PHOTOS_MAX,
  type RecordPhoto,
  type RecordPhotoInsert,
  type UploadRecordPhotoInput,
} from "./types";

/**
 * Upload a diary photo to Storage, then persist a record_photos row.
 *
 * - Enforces the per-record max.
 * - Picks the lowest free `photo_order` so deleted slots are reused and
 *   existing files are never overwritten.
 * Throws on validation / auth / storage / database errors.
 */
export async function uploadRecordPhoto(
  input: UploadRecordPhotoInput,
): Promise<RecordPhoto> {
  const recordId = input.recordId?.trim() ?? "";
  if (!recordId) {
    throw new Error("Missing required field: recordId");
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

  const existing = await listRecordPhotos(recordId);

  if (existing.length >= RECORD_PHOTOS_MAX) {
    throw new Error("已達上限。");
  }

  const usedOrders = new Set(existing.map((photo) => photo.photoOrder));
  let photoOrder = 1;
  while (usedOrders.has(photoOrder)) {
    photoOrder += 1;
  }

  const contentType = input.file.type || undefined;
  const { path } = await uploadDiaryPhoto(
    {
      recordId,
      file: input.file,
      index: photoOrder,
    },
    contentType ? { contentType } : undefined,
  );

  const row: RecordPhotoInsert = {
    record_id: recordId,
    storage_path: path,
    photo_order: photoOrder,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("record_photos")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create record photo");
  }

  return toRecordPhoto(data);
}
