import { createClient } from "@/src/lib/supabase/client";

import { toMenuItem } from "./map";
import {
  normalizeCategory,
  normalizeDisplayOrder,
  normalizeName,
  normalizePrice,
} from "./normalize";
import type {
  MenuItem,
  MenuItemUpdate,
  UpdateMenuItemInput,
} from "./types";

/**
 * Update an existing menu item.
 * Only provided fields are written.
 */
export async function updateMenuItem(
  input: UpdateMenuItemInput,
): Promise<MenuItem> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  const patch: MenuItemUpdate = {};

  if (input.category !== undefined) {
    patch.category = normalizeCategory(input.category);
  }

  if (input.name !== undefined) {
    const name = normalizeName(input.name);
    if (!name) {
      throw new Error("Missing required field: name");
    }
    patch.name = name;
  }

  if (input.price !== undefined) {
    patch.price = normalizePrice(input.price);
  }

  if (input.displayOrder !== undefined) {
    patch.display_order = normalizeDisplayOrder(input.displayOrder);
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No fields to update");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to update menu item");
  }

  return toMenuItem(data);
}
