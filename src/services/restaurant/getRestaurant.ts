import { createClient } from "@/src/lib/supabase/client";

import type { RestaurantRecord } from "./types";

/**
 * Fetch one restaurant for the signed-in user's current group.
 * Returns null when unauthenticated, no group, or restaurant not in group.
 */
export async function getRestaurant(
  id: string,
): Promise<RestaurantRecord | null> {
  const restaurantId = id.trim();
  if (!restaurantId) {
    return null;
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
    return null;
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
    return null;
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
