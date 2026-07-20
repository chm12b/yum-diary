import { createClient } from "@/src/lib/supabase/client";

import type { RestaurantRecord } from "./types";

/**
 * List restaurants for a group.
 * Ordered by created_at DESC. Returns [] when groupId is empty.
 * Caller supplies groupId (e.g. from CurrentGroupContext) — no auth/profile lookup.
 */
export async function listRestaurants(
  groupId: string,
): Promise<RestaurantRecord[]> {
  const id = groupId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("group_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
