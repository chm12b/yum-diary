import { createClient } from "@/src/lib/supabase/client";

import { toMenuItem } from "./map";
import {
  normalizeCategory,
  normalizeDisplayOrder,
  normalizeName,
  normalizePrice,
} from "./normalize";
import type {
  CreateMenuItemInput,
  MenuItem,
  MenuItemInsert,
} from "./types";

/**
 * Create a single menu item for a restaurant.
 * Defaults category to「其他」when blank.
 */
export async function createMenuItem(
  input: CreateMenuItemInput,
): Promise<MenuItem> {
  const restaurantId = input.restaurantId?.trim() ?? "";
  if (!restaurantId) {
    throw new Error("Missing required field: restaurantId");
  }

  const name = normalizeName(input.name);
  if (!name) {
    throw new Error("Missing required field: name");
  }

  const row: MenuItemInsert = {
    restaurant_id: restaurantId,
    category: normalizeCategory(input.category),
    name,
    price: normalizePrice(input.price),
    display_order: normalizeDisplayOrder(input.displayOrder),
  };

  const supabase = createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create menu item");
  }

  return toMenuItem(data);
}
