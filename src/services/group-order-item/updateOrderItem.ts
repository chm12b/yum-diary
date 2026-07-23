import { createClient } from "@/src/lib/supabase/client";
import { requireWritableGroupOrder } from "@/src/services/group-order";

import { toGroupOrderItem } from "./map";
import { normalizeNote, normalizeQuantity } from "./normalize";
import type {
  GroupOrderItem,
  GroupOrderItemUpdate,
  UpdateOrderItemInput,
} from "./types";

async function resolveGroupOrderIdForItem(
  itemId: string,
): Promise<string> {
  const supabase = createClient();
  const { data: item, error: itemError } = await supabase
    .from("group_order_items")
    .select("participant_id")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    throw itemError;
  }
  if (!item) {
    throw new Error("Order item not found");
  }

  const { data: participant, error: participantError } = await supabase
    .from("group_order_participants")
    .select("group_order_id")
    .eq("id", item.participant_id)
    .maybeSingle();

  if (participantError) {
    throw participantError;
  }
  if (!participant) {
    throw new Error("Participant not found");
  }

  return participant.group_order_id;
}

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

  const groupOrderId = await resolveGroupOrderIdForItem(id);
  await requireWritableGroupOrder(groupOrderId);

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
