import { createClient } from "@/src/lib/supabase/client";

import { getGroupOrder } from "./getGroupOrder";
import { toGroupOrder } from "./map";
import type { GroupOrder } from "./types";

export type CompleteGroupOrderInput = {
  id: string;
};

/**
 * Host-only: mark a CLOSED group order as COMPLETED.
 * Sets completed_at = now() and verifies created_by == auth.uid().
 */
export async function completeGroupOrder(
  input: CompleteGroupOrderInput,
): Promise<GroupOrder> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("Not authenticated");
  }

  const order = await getGroupOrder(id);
  if (!order) {
    throw new Error("Group order not found");
  }

  if (order.createdBy !== user.id) {
    throw new Error("Only the host can complete the group order");
  }

  if (order.status === "COMPLETED") {
    throw new Error("Group order is already completed");
  }

  if (order.status !== "CLOSED") {
    throw new Error("Only a closed group order can be completed");
  }

  const completedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("group_orders")
    .update({
      status: "COMPLETED",
      completed_at: completedAt,
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to complete group order");
  }

  return toGroupOrder(data);
}
