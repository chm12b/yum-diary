import { createClient } from "@/src/lib/supabase/client";
import { APP_CATEGORIES } from "@/src/lib/restaurants/category";

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

  const coreRow: RestaurantInsert = {
    group_id: groupId,
    created_by: user.id,
    name,
    category,
    address: optionalText(input.address),
    phone: optionalText(input.phone),
    website_url: optionalText(input.website),
    notes: optionalText(input.note),
    business_hours: normalizeBusinessHours(input.businessHours),
    google_place_id: optionalText(input.googlePlaceId),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    price_min: input.priceMin ?? null,
    price_max: input.priceMax ?? null,
  };

  const fullRow: RestaurantInsert = {
    ...coreRow,
    google_rating: input.googleRating ?? null,
    google_rating_count: input.googleRatingCount ?? null,
    price_level: input.priceLevel ?? null,
  };

  let { data, error } = await supabase
    .from("restaurants")
    .insert(fullRow)
    .select("*")
    .single();

  // Migration 014 may not be applied yet — still create the restaurant.
  if (error && isMissingColumnError(error, METADATA_COLUMNS)) {
    const retry = await supabase
      .from("restaurants")
      .insert(coreRow)
      .select("*")
      .single();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create restaurant");
  }

  return data;
}
