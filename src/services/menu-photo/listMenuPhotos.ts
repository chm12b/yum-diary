import { createClient } from "@/src/lib/supabase/client";

import { toMenuPhoto } from "./map";
import type { MenuPhoto } from "./types";

/**
 * List a restaurant's menu photos (album order: page ASC, then created_at ASC).
 * Menu is group-shared, so results are not scoped to the current user.
 * Returns [] when the id is blank.
 */
export async function listMenuPhotos(
  restaurantId: string,
): Promise<MenuPhoto[]> {
  const id = restaurantId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("menu_photos")
    .select("*")
    .eq("restaurant_id", id)
    .order("page", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toMenuPhoto);
}
