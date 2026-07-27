import { createClient } from "@/src/lib/supabase/client";

import type { RestaurantRecord } from "./types";

/**
 * Restore an archived restaurant in the signed-in user's current group.
 * Sets archived_at = NULL so it reappears in general lists.
 */
export async function unarchiveRestaurant(
  id: string,
): Promise<RestaurantRecord> {
  const restaurantId = id.trim();
  if (!restaurantId) {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }
  if (!profile.current_group_id) {
    throw new Error("No current group");
  }

  const { data: existing, error: existingError } = await supabase
    .from("restaurants")
    .select("id, archived_at")
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }
  if (!existing) {
    throw new Error("Restaurant not found");
  }
  if (existing.archived_at == null) {
    throw new Error("Restaurant is not archived");
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update({ archived_at: null })
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .not("archived_at", "is", null)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to restore restaurant");
  }

  return data;
}
