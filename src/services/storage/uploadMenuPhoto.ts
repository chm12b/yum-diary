import { menuPhotoPath } from "@/src/lib/storage/file-name";

import { uploadPhoto } from "./upload";
import type {
  UploadMenuPhotoParams,
  UploadOptions,
  UploadResult,
} from "./types";

/**
 * Upload a menu image to `menus/{restaurantId}/menu-NN.webp`.
 */
export async function uploadMenuPhoto(
  params: UploadMenuPhotoParams,
  options?: UploadOptions,
): Promise<UploadResult> {
  const { restaurantId, file, index } = params;
  const path = menuPhotoPath(restaurantId, index);

  return uploadPhoto(path, file, options);
}
