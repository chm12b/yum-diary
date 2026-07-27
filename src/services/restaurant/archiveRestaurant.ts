import { createClient } from "@/src/lib/supabase/client";

import type { RestaurantRecord } from "./types";

/**
 * Archive a restaurant in the signed-in user's current group.
 * Soft-hide only: sets archived_at = now(); does not delete data.
 */
export async function archiveRestaurant(
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
  if (existing.archived_at != null) {
    throw new Error("Restaurant is already archived");
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .is("archived_at", null)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to archive restaurant");
  }

  return data;
}
