import { createClient } from "@/src/lib/supabase/client";
import { APP_CATEGORIES } from "@/src/lib/restaurants/category";

import type {
  BusinessHoursInput,
  RestaurantRecord,
} from "./types";
import {
  normalizeBusinessHours,
  optionalText,
  requireTrimmed,
} from "./write-helpers";

export type UpdateRestaurantInput = {
  name: string;
  category: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  businessHours?: BusinessHoursInput | null;
  note?: string | null;
  googlePlaceId?: string | null;
};

/**
 * Update a restaurant in the signed-in user's current group.
 * Throws on validation / auth / database errors.
 * Returns the updated restaurant row.
 */
export async function updateRestaurant(
  id: string,
  input: UpdateRestaurantInput,
): Promise<RestaurantRecord> {
  const restaurantId = requireTrimmed(id, "id");
  const name = requireTrimmed(input.name, "name");
  const category = requireTrimmed(input.category, "category");

  if (!(APP_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(`Invalid category: ${category}`);
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
    throw new Error("找不到目前群組，請先建立或加入群組");
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update({
      name,
      category,
      address: optionalText(input.address),
      phone: optionalText(input.phone),
      website_url: optionalText(input.website),
      notes: optionalText(input.note),
      business_hours: normalizeBusinessHours(input.businessHours),
      google_place_id: optionalText(input.googlePlaceId),
      updated_at: new Date().toISOString(),
    })
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("找不到這間餐廳，或沒有權限修改");
  }

  return data;
}
