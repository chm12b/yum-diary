import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrder } from "./map";
import type { GroupOrder } from "./types";

/**
 * Fetch one group order by id. Returns null when not found / inaccessible.
 */
export async function getGroupOrder(
  id: string,
): Promise<GroupOrder | null> {
  const orderId = id.trim();
  if (!orderId) {
    return null;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("group_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toGroupOrder(data) : null;
}
