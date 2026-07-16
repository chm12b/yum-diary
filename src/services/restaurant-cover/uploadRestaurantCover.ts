import { createClient } from "@/src/lib/supabase/client";
import { uploadRestaurantPhoto } from "@/src/services/storage";

import type {
  RestaurantCoverResult,
  UploadRestaurantCoverInput,
} from "./types";

/**
 * Upload (or overwrite) the restaurant cover at
 * `restaurants/{restaurantId}/cover.webp`, then persist the path on the
 * restaurants row. Does not create additional photo slots.
 */
export async function uploadRestaurantCover(
  input: UploadRestaurantCoverInput,
): Promise<RestaurantCoverResult> {
  const restaurantId = input.restaurantId?.trim() ?? "";
  if (!restaurantId) {
    throw new Error("Missing required field: restaurantId");
  }
  if (!input.file) {
    throw new Error("Missing required field: file");
  }

  const contentType =
    "type" in input.file && input.file.type ? input.file.type : undefined;

  const { path, publicUrl } = await uploadRestaurantPhoto(
    {
      restaurantId,
      file: input.file,
      slot: "cover",
    },
    contentType ? { contentType, upsert: true } : { upsert: true },
  );

  const supabase = createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ restaurant_cover_path: path })
    .eq("id", restaurantId);

  if (error) {
    throw error;
  }

  return { path, publicUrl };
}
