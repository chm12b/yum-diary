import { createClient } from "@/src/lib/supabase/client";

import type { RestaurantRecord } from "./types";

/**
 * List archived restaurants in the signed-in user's current group.
 * Ordered by archived_at DESC.
 */
export async function listArchivedRestaurants(): Promise<RestaurantRecord[]> {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }
  if (!profile.current_group_id) {
    return [];
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("group_id", profile.current_group_id)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
