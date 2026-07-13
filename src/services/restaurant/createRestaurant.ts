import { createClient } from "@/src/lib/supabase/client";
import { APP_CATEGORIES } from "@/src/lib/restaurants/category";

import type {
  CreateRestaurantInput,
  Json,
  RestaurantInsert,
  RestaurantRecord,
} from "./types";

function requireTrimmed(value: string | undefined | null, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new Error(`Missing required field: ${field}`);
  }
  return trimmed;
}

function optionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function normalizeBusinessHours(
  businessHours: CreateRestaurantInput["businessHours"],
): Json | null {
  if (!businessHours) {
    return null;
  }

  const periods = (businessHours.periods ?? [])
    .map((period) => ({
      open: period.open?.trim() ?? "",
      close: period.close?.trim() ?? "",
    }))
    .filter((period) => period.open !== "" || period.close !== "");

  const closedDays = (businessHours.closedDays ?? []).filter(
    (day) => day.trim().length > 0,
  );

  const hasFlags =
    businessHours.openAllYear === true ||
    businessHours.irregularHolidays === true;

  if (periods.length === 0 && closedDays.length === 0 && !hasFlags) {
    return null;
  }

  return {
    periods,
    closedDays,
    ...(businessHours.openAllYear !== undefined
      ? { openAllYear: businessHours.openAllYear }
      : {}),
    ...(businessHours.irregularHolidays !== undefined
      ? { irregularHolidays: businessHours.irregularHolidays }
      : {}),
  };
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

  const row: RestaurantInsert = {
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
  };

  const { data, error } = await supabase
    .from("restaurants")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create restaurant");
  }

  return data;
}
