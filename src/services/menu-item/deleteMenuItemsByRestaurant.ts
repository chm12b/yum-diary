import { createClient } from "@/src/lib/supabase/client";

/**
 * Delete all menu items for a restaurant (overwrite import).
 */
export async function deleteMenuItemsByRestaurant(
  restaurantId: string,
): Promise<void> {
  const id = restaurantId.trim();
  if (!id) {
    throw new Error("Missing required field: restaurantId");
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("restaurant_id", id);

  if (error) {
    throw error;
  }
}
