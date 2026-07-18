import { createClient } from "@/src/lib/supabase/client";
import type { RestaurantRecord } from "@/src/services/restaurant";

export type RestaurantFavorite = {
  id: string;
  restaurantId: string;
  userId: string;
  createdAt: string;
};

function mapFavorite(row: {
  id: string;
  restaurant_id: string;
  user_id: string;
  created_at: string;
}): RestaurantFavorite {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export async function isFavorite(restaurantId: string): Promise<boolean> {
  const id = restaurantId.trim();
  if (!id) {
    return false;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurant_favorites")
    .select("id")
    .eq("restaurant_id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
}

export async function listFavorites(): Promise<RestaurantFavorite[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurant_favorites")
    .select("id, restaurant_id, user_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapFavorite);
}

/**
 * List the signed-in user's favorite restaurants in their current group.
 * Favorites and restaurants are fetched in one relational query.
 */
export async function listFavoriteRestaurants(): Promise<RestaurantRecord[]> {
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
    .from("restaurant_favorites")
    .select("restaurants!inner(*)")
    .eq("user_id", user.id)
    .eq("restaurants.group_id", profile.current_group_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (favorite) =>
      favorite.restaurants as unknown as RestaurantRecord,
  );
}

/**
 * Toggle the signed-in user's favorite and return its new state.
 * RLS limits every read and write to the current user.
 */
export async function toggleFavorite(restaurantId: string): Promise<boolean> {
  const id = restaurantId.trim();
  if (!id) {
    throw new Error("Restaurant ID is required.");
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
    throw new Error("Authentication is required.");
  }

  const { data: existing, error: lookupError } = await supabase
    .from("restaurant_favorites")
    .select("id")
    .eq("restaurant_id", id)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("restaurant_favorites")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      throw deleteError;
    }

    return false;
  }

  const { error: insertError } = await supabase
    .from("restaurant_favorites")
    .insert({
      restaurant_id: id,
      user_id: user.id,
    });

  if (insertError) {
    throw insertError;
  }

  return true;
}
