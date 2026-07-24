import { createClient } from "@/src/lib/supabase/client";

import { getGroupOrder } from "./getGroupOrder";
import { toGroupOrder } from "./map";
import type { GroupOrder } from "./types";

export type CloseGroupOrderInput = {
  id: string;
};

/**
 * Host-only: manually stop ordering (OPEN → CLOSED).
 * Same end state as automatic deadline close.
 */
export async function closeGroupOrder(
  input: CloseGroupOrderInput,
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
    throw new Error("Only the host can stop ordering");
  }

  if (order.status === "COMPLETED") {
    throw new Error("Completed group order cannot be closed");
  }

  if (order.status !== "OPEN") {
    throw new Error("Only an open group order can be stopped");
  }

  const { data, error } = await supabase
    .from("group_orders")
    .update({ status: "CLOSED" })
    .eq("id", id)
    .eq("created_by", user.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to close group order");
  }

  return toGroupOrder(data);
}
