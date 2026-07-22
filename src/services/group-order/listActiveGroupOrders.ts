import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrder } from "./map";
import type { GroupOrder } from "./types";

/**
 * List active (OPEN / CLOSED) group orders for a group.
 * COMPLETED is excluded from home / active lists.
 */
export async function listActiveGroupOrders(
  groupId: string,
): Promise<GroupOrder[]> {
  const id = groupId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("group_orders")
    .select("*")
    .eq("group_id", id)
    .in("status", ["OPEN", "CLOSED"])
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toGroupOrder);
}
