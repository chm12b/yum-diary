import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrderItem } from "./map";
import { normalizeNote, normalizeQuantity } from "./normalize";
import type {
  GroupOrderItem,
  GroupOrderItemUpdate,
  UpdateOrderItemInput,
} from "./types";

/**
 * Update quantity / note on an order item owned by the signed-in user.
 */
export async function updateOrderItem(
  input: UpdateOrderItemInput,
): Promise<GroupOrderItem> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  const patch: GroupOrderItemUpdate = {};
  if (input.quantity !== undefined) {
    patch.quantity = normalizeQuantity(input.quantity);
  }
  if (input.note !== undefined) {
    patch.note = normalizeNote(input.note);
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No fields to update");
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("group_order_items")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to update order item");
  }

  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("name, price")
    .eq("id", data.menu_item_id)
    .maybeSingle();

  if (menuError) {
    throw menuError;
  }

  return toGroupOrderItem(
    data,
    menuItem
      ? {
          name: menuItem.name,
          price: menuItem.price == null ? null : Number(menuItem.price),
        }
      : null,
  );
}
