import { createClient } from "@/src/lib/supabase/client";
import { requireWritableGroupOrder } from "@/src/services/group-order";

import type { DeleteOrderItemInput } from "./types";

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
 * Delete an order item owned by the signed-in user.
 */
export async function deleteOrderItem(
  input: DeleteOrderItemInput,
): Promise<void> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  const groupOrderId = await resolveGroupOrderIdForItem(id);
  await requireWritableGroupOrder(groupOrderId);

  const supabase = createClient();
  const { error } = await supabase
    .from("group_order_items")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
