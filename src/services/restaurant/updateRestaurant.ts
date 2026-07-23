import { createClient } from "@/src/lib/supabase/client";
import { APP_CATEGORIES } from "@/src/lib/restaurants/category";

import { resolveCityDistrict } from "./resolveCityDistrict";
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

function sameNullable(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return (a ?? null) === (b ?? null);
}

/**
 * Update a restaurant in the signed-in user's current group.
 * Throws on validation / auth / database errors.
 * Returns the updated restaurant row.
 *
 * Address change → re-parse city/district via resolveCityDistrict().
 * Parse failure → keep existing city/district (never overwrite with null).
 * Address unchanged → do not re-parse or touch city/district.
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

  const { data: existing, error: existingError } = await supabase
    .from("restaurants")
    .select("address, city, district")
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existing) {
    throw new Error("找不到這間餐廳，或沒有權限修改");
  }

  const nextAddress = optionalText(input.address);
  const addressChanged = !sameNullable(existing.address, nextAddress);

  const patch: {
    name: string;
    category: string;
    address: string | null;
    phone: string | null;
    website_url: string | null;
    notes: string | null;
    business_hours: ReturnType<typeof normalizeBusinessHours>;
    google_place_id: string | null;
    updated_at: string;
    city?: string | null;
    district?: string | null;
  } = {
    name,
    category,
    address: nextAddress,
    phone: optionalText(input.phone),
    website_url: optionalText(input.website),
    notes: optionalText(input.note),
    business_hours: normalizeBusinessHours(input.businessHours),
    google_place_id: optionalText(input.googlePlaceId),
    updated_at: new Date().toISOString(),
  };

  if (addressChanged) {
    const parsed = resolveCityDistrict(nextAddress);
    // Only write location when parser found something; otherwise keep DB values.
    if (parsed.city != null || parsed.district != null) {
      patch.city = parsed.city;
      patch.district = parsed.district;
    }
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update(patch)
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
