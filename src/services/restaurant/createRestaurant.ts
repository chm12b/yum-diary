import { createClient } from "@/src/lib/supabase/client";
import { APP_CATEGORIES } from "@/src/lib/restaurants/category";

import { resolveCityDistrict } from "./resolveCityDistrict";
import type {
  CreateRestaurantInput,
  RestaurantInsert,
  RestaurantRecord,
} from "./types";
import {
  isMissingColumnError,
  normalizeBusinessHours,
  optionalText,
  requireTrimmed,
} from "./write-helpers";

/** Columns added by migration 014 — may be absent if it isn't applied yet. */
const METADATA_COLUMNS = [
  "google_rating",
  "google_rating_count",
  "price_level",
] as const;

/** Columns added by migration 028 — may be absent if it isn't applied yet. */
const CITY_DISTRICT_COLUMNS = ["city", "district"] as const;

export const DUPLICATE_RESTAURANT_MESSAGE = "此餐廳已存在於目前群組。";

function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") {
    return true;
  }
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("duplicate key") ||
    message.includes("unique constraint") ||
    message.includes("restaurants_group_id_google_place_id_key")
  );
}

/**
 * Insert a restaurant into the current user's group.
 * Throws on validation / auth / database errors.
 * Returns the inserted restaurant row.
 */
export async function createRestaurant(
  input: CreateRestaurantInput,
): Promise<RestaurantRecord> {
  const groupId = requireTrimmed(input.groupId, "groupId");
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

  const googlePlaceId = optionalText(input.googlePlaceId);

  if (googlePlaceId) {
    const { data: existing, error: existingError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("group_id", groupId)
      .eq("google_place_id", googlePlaceId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      throw new Error(DUPLICATE_RESTAURANT_MESSAGE);
    }
  }

  const address = optionalText(input.address);
  const { city, district } = resolveCityDistrict(address);

  const coreRow: RestaurantInsert = {
    group_id: groupId,
    created_by: user.id,
    name,
    category,
    address,
    phone: optionalText(input.phone),
    website_url: optionalText(input.website),
    notes: optionalText(input.note),
    business_hours: normalizeBusinessHours(input.businessHours),
    google_place_id: googlePlaceId,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    price_min: input.priceMin ?? null,
    price_max: input.priceMax ?? null,
  };

  const withLocation: RestaurantInsert = {
    ...coreRow,
    city,
    district,
  };

  const fullRow: RestaurantInsert = {
    ...withLocation,
    google_rating: input.googleRating ?? null,
    google_rating_count: input.googleRatingCount ?? null,
    price_level: input.priceLevel ?? null,
  };

  let { data, error } = await supabase
    .from("restaurants")
    .insert(fullRow)
    .select("*")
    .single();

  // Migration 014 may not be applied yet — still create with city/district.
  if (error && isMissingColumnError(error, METADATA_COLUMNS)) {
    const retry = await supabase
      .from("restaurants")
      .insert(withLocation)
      .select("*")
      .single();

    data = retry.data;
    error = retry.error;
  }

  // Migration 028 may not be applied yet — still create the restaurant.
  if (error && isMissingColumnError(error, CITY_DISTRICT_COLUMNS)) {
    const retry = await supabase
      .from("restaurants")
      .insert(coreRow)
      .select("*")
      .single();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (isUniqueViolation(error)) {
      throw new Error(DUPLICATE_RESTAURANT_MESSAGE);
    }
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create restaurant");
  }

  return data;
}
