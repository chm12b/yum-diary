import type { AuthError, PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/src/lib/supabase/client";
import type { Database } from "@/src/types/database";

export type RestaurantResult<T> = {
  data: T;
  error: PostgrestError | AuthError | null;
};

export type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];

export async function listRestaurants(): Promise<
  RestaurantResult<RestaurantRow[]>
> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: [], error: userError };
  }

  if (!user) {
    return { data: [], error: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_group_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { data: [], error: profileError };
  }

  if (!profile.current_group_id) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("group_id", profile.current_group_id)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error };
}

export async function getRestaurant(
  restaurantId: string,
): Promise<RestaurantResult<RestaurantRow | null>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}
