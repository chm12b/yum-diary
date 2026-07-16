import type { PlaceDetailItem, PlacesApiResponse } from "@/src/lib/google/places/types";
import { createClient } from "@/src/lib/supabase/client";

import { getRestaurant } from "./getRestaurant";
import type { RestaurantRecord } from "./types";
import {
  isMissingColumnError,
  normalizeBusinessHours,
  optionalText,
  requireTrimmed,
} from "./write-helpers";

export class GoogleSyncNotFoundError extends Error {
  constructor(message = "找不到 Google 資料") {
    super(message);
    this.name = "GoogleSyncNotFoundError";
  }
}

/** Columns added by later migrations (009 photo, 014 metadata) — may be absent. */
const OPTIONAL_SYNC_COLUMNS = [
  "google_photo_reference",
  "google_rating",
  "google_rating_count",
  "price_level",
] as const;

/**
 * Re-sync restaurant contact / hours fields from Google Place Details.
 * Does not update name, category, or notes.
 */
export async function syncRestaurantFromGoogle(
  id: string,
): Promise<RestaurantRecord> {
  const restaurantId = requireTrimmed(id, "id");
  const restaurant = await getRestaurant(restaurantId);

  if (!restaurant) {
    throw new GoogleSyncNotFoundError();
  }

  const placeId = restaurant.google_place_id?.trim() ?? "";
  if (!placeId) {
    throw new GoogleSyncNotFoundError();
  }

  let response: Response;
  try {
    response = await fetch(
      `/api/google/places/${encodeURIComponent(placeId)}`,
    );
  } catch {
    throw new GoogleSyncNotFoundError();
  }

  let payload: PlacesApiResponse<PlaceDetailItem>;
  try {
    payload = (await response.json()) as PlacesApiResponse<PlaceDetailItem>;
  } catch {
    throw new GoogleSyncNotFoundError();
  }

  if (!response.ok || payload.error || !payload.data) {
    throw new GoogleSyncNotFoundError();
  }

  const detail = payload.data;
  const now = new Date().toISOString();
  const photoReference = optionalText(detail.photo);

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
    throw new GoogleSyncNotFoundError();
  }

  const coreUpdate = {
    phone: optionalText(detail.phone),
    address: optionalText(detail.address),
    website_url: optionalText(detail.website),
    business_hours: normalizeBusinessHours(detail.businessHours),
    latitude: detail.latitude ?? null,
    longitude: detail.longitude ?? null,
    price_min: detail.priceMin ?? null,
    price_max: detail.priceMax ?? null,
    last_google_sync_at: now,
    updated_at: now,
  };

  // Optional columns depend on migrations 009 / 014 being applied.
  const fullUpdate = {
    ...coreUpdate,
    google_photo_reference: photoReference,
    google_rating: detail.rating ?? null,
    google_rating_count: detail.reviewCount ?? null,
    price_level: detail.priceLevel ?? null,
  };

  let { data, error } = await supabase
    .from("restaurants")
    .update(fullUpdate)
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .select("*")
    .maybeSingle();

  // A later migration may not be applied yet — still sync the core Google fields.
  if (error && isMissingColumnError(error, OPTIONAL_SYNC_COLUMNS)) {
    const retry = await supabase
      .from("restaurants")
      .update(coreUpdate)
      .eq("id", restaurantId)
      .eq("group_id", profile.current_group_id)
      .select("*")
      .maybeSingle();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw error;
  }

  if (!data) {
    throw new GoogleSyncNotFoundError();
  }

  return data;
}
