import {
  restaurantCoverPath,
  restaurantPhotoPath,
} from "@/src/lib/storage/file-name";

import { uploadPhoto } from "./upload";
import type {
  UploadOptions,
  UploadResult,
  UploadRestaurantPhotoParams,
} from "./types";

/**
 * Upload a restaurant image to `restaurants/{restaurantId}/`.
 * `slot: "cover"` → cover.webp; a number → photo-NN.webp.
 */
export async function uploadRestaurantPhoto(
  params: UploadRestaurantPhotoParams,
  options?: UploadOptions,
): Promise<UploadResult> {
  const { restaurantId, file, slot } = params;

  const path =
    slot === "cover"
      ? restaurantCoverPath(restaurantId)
      : restaurantPhotoPath(restaurantId, slot);

  return uploadPhoto(path, file, options);
}
