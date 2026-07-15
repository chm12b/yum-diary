import { diaryPhotoPath } from "@/src/lib/storage/file-name";

import { uploadPhoto } from "./upload";
import type {
  UploadDiaryPhotoParams,
  UploadOptions,
  UploadResult,
} from "./types";

/**
 * Upload a diary image to `records/{recordId}/photo-NN.webp`.
 */
export async function uploadDiaryPhoto(
  params: UploadDiaryPhotoParams,
  options?: UploadOptions,
): Promise<UploadResult> {
  const { recordId, file, index } = params;
  const path = diaryPhotoPath(recordId, index);

  return uploadPhoto(path, file, options);
}
