import { createClient } from "@/src/lib/supabase/client";

import type { DiningRecord } from "./types";

/**
 * List dining records for a restaurant visible to the signed-in user.
 * Same-group members can read (RLS); ordered by visit_date DESC, then created_at DESC.
 * Returns [] when unauthenticated.
 */
export async function listRestaurantRecords(
  restaurantId: string,
): Promise<DiningRecord[]> {
  const id = restaurantId.trim();
  if (!id) {
    return [];
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
    return [];
  }

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("restaurant_id", id)
    .order("visit_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
