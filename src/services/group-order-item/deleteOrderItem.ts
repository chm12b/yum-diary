import { createClient } from "@/src/lib/supabase/client";

import type { DeleteOrderItemInput } from "./types";

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

  const supabase = createClient();
  const { error } = await supabase
    .from("group_order_items")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
