import { createClient } from "@/src/lib/supabase/client";
import { deletePhoto } from "@/src/services/storage";

import type { DeleteRestaurantCoverInput } from "./types";

/**
 * Clear the restaurant cover: null the DB path first, then remove the Storage
 * object. Throws on validation / database / storage errors.
 */
export async function deleteRestaurantCover(
  input: DeleteRestaurantCoverInput,
): Promise<void> {
  const restaurantId = input.restaurantId?.trim() ?? "";
  if (!restaurantId) {
    throw new Error("Missing required field: restaurantId");
  }

  const storagePath = input.storagePath?.trim() ?? "";
  if (!storagePath) {
    throw new Error("Missing required field: storagePath");
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("restaurants")
    .update({ restaurant_cover_path: null })
    .eq("id", restaurantId);

  if (error) {
    throw error;
  }

  await deletePhoto(storagePath);
}
