import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrder } from "./map";
import type { GroupOrder } from "./types";

export type ListCompletedGroupOrdersOptions = {
  /** When set, return at most this many rows (newest first). */
  limit?: number;
};

/**
 * List COMPLETED group orders for a group, newest completed_at first.
 */
export async function listCompletedGroupOrders(
  groupId: string,
  options: ListCompletedGroupOrdersOptions = {},
): Promise<GroupOrder[]> {
  const id = groupId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  let query = supabase
    .from("group_orders")
    .select("*")
    .eq("group_id", id)
    .eq("status", "COMPLETED")
    .order("completed_at", { ascending: false, nullsFirst: false });

  if (options.limit != null && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map(toGroupOrder);
}
