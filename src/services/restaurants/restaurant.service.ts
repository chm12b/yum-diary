import type { AuthError, PostgrestError } from "@supabase/supabase-js";

import { getRestaurant as getRestaurantForGroup } from "@/src/services/restaurant/getRestaurant";
import { listRestaurants as listRestaurantsForGroup } from "@/src/services/restaurant/listRestaurants";
import type { Database } from "@/src/types/database";

export type RestaurantResult<T> = {
  data: T;
  error: PostgrestError | AuthError | null;
};

export type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];

export async function listRestaurants(
  groupId: string,
): Promise<RestaurantResult<RestaurantRow[]>> {
  try {
    const data = await listRestaurantsForGroup(groupId);
    return { data, error: null };
  } catch (error) {
    return {
      data: [],
      error: error as PostgrestError | AuthError,
    };
  }
}

export async function getRestaurant(
  restaurantId: string,
): Promise<RestaurantResult<RestaurantRow | null>> {
  try {
    const data = await getRestaurantForGroup(restaurantId);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error as PostgrestError | AuthError,
    };
  }
}
