import type { PlaceDetailItem, PlacesApiResponse } from "@/src/lib/google/places/types";
import { createClient } from "@/src/lib/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

import { getRestaurant } from "./getRestaurant";
import type { RestaurantRecord } from "./types";
import {
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

function isMissingPhotoColumnError(error: PostgrestError | null): boolean {
  if (!error) {
    return false;
  }

  const message = `${error.message} ${error.details ?? ""} ${error.hint ?? ""}`;
  return message.toLowerCase().includes("google_photo_reference");
}

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

  const baseUpdate = {
    phone: optionalText(detail.phone),
    address: optionalText(detail.address),
    website_url: optionalText(detail.website),
    business_hours: normalizeBusinessHours(detail.businessHours),
    last_google_sync_at: now,
    updated_at: now,
  };

  const withPhotoUpdate = {
    ...baseUpdate,
    google_photo_reference: photoReference,
  };

  let { data, error } = await supabase
    .from("restaurants")
    .update(withPhotoUpdate)
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .select("*")
    .maybeSingle();

  // Migration 009 may not be applied yet — still sync the core Google fields.
  if (error && isMissingPhotoColumnError(error)) {
    const retry = await supabase
      .from("restaurants")
      .update(baseUpdate)
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
