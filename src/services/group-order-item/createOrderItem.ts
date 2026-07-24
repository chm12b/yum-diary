import { requireWritableGroupOrder } from "@/src/services/group-order";
import { createClient } from "@/src/lib/supabase/client";
import { getMyParticipant } from "@/src/services/group-order-participant";

import { toGroupOrderItem } from "./map";
import { normalizeNote, normalizeQuantity } from "./normalize";
import type {
  CreateOrderItemInput,
  GroupOrderItem,
  GroupOrderItemInsert,
} from "./types";

/**
 * Add a menu item to the signed-in user's order.
 * If the same menu_item already exists for this participant, increments quantity
 * instead of inserting a second row (MVP: note / options ignored).
 */
export async function createOrderItem(
  input: CreateOrderItemInput,
): Promise<GroupOrderItem> {
  const groupOrderId = input.groupOrderId?.trim() ?? "";
  const menuItemId = input.menuItemId?.trim() ?? "";
  if (!groupOrderId) {
    throw new Error("Missing required field: groupOrderId");
  }
  if (!menuItemId) {
    throw new Error("Missing required field: menuItemId");
  }

  const order = await requireWritableGroupOrder(groupOrderId);

  const participant = await getMyParticipant(groupOrderId);
  if (!participant) {
    throw new Error("Not a participant of this group order");
  }

  const supabase = createClient();

  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("id, restaurant_id, name, price, display_order")
    .eq("id", menuItemId)
    .maybeSingle();

  if (menuError) {
    throw menuError;
  }
  if (!menuItem) {
    throw new Error("Menu item not found");
  }
  if (menuItem.restaurant_id !== order.restaurantId) {
    throw new Error("Menu item does not belong to this restaurant");
  }

  const menuSnapshot = {
    name: menuItem.name,
    price: menuItem.price == null ? null : Number(menuItem.price),
    displayOrder: menuItem.display_order,
  };

  const { data: existing, error: existingError } = await supabase
    .from("group_order_items")
    .select("*")
    .eq("participant_id", participant.id)
    .eq("menu_item_id", menuItemId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    const nextQuantity =
      existing.quantity + normalizeQuantity(input.quantity);
    const { data, error } = await supabase
      .from("group_order_items")
      .update({ quantity: nextQuantity })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("Failed to update order item quantity");
    }

    return toGroupOrderItem(data, menuSnapshot);
  }

  const row: GroupOrderItemInsert = {
    participant_id: participant.id,
    menu_item_id: menuItemId,
    quantity: normalizeQuantity(input.quantity),
    note: normalizeNote(input.note),
  };

  const { data, error } = await supabase
    .from("group_order_items")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create order item");
  }

  return toGroupOrderItem(data, menuSnapshot);
}
