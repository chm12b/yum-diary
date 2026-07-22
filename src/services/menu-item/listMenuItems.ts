import { createClient } from "@/src/lib/supabase/client";

import { toMenuItem } from "./map";
import type { MenuItem } from "./types";

/**
 * List a restaurant's menu items (display_order ASC, then created_at ASC).
 * Returns [] when the id is blank.
 */
export async function listMenuItems(
  restaurantId: string,
): Promise<MenuItem[]> {
  const id = restaurantId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toMenuItem);
}
