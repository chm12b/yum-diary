import { createClient } from "@/src/lib/supabase/client";

import type {
  CreateRecordInput,
  DiningRecord,
  DiningRecordInsert,
} from "./types";

const NOTES_MAX = 200;

function requireTrimmed(
  value: string | undefined | null,
  field: string,
): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new Error(`Missing required field: ${field}`);
  }
  return trimmed;
}

/**
 * Create a dining record for the signed-in user on a restaurant in their group.
 * Throws on validation / auth / database errors.
 */
export async function createRecord(
  input: CreateRecordInput,
): Promise<DiningRecord> {
  const restaurantId = requireTrimmed(input.restaurantId, "restaurantId");
  const visitDate = requireTrimmed(input.visitDate, "visitDate");
  const notes = requireTrimmed(input.notes, "notes");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
    throw new Error("Invalid visitDate");
  }

  if (
    !Number.isInteger(input.rating) ||
    input.rating < 1 ||
    input.rating > 5
  ) {
    throw new Error("Invalid rating");
  }

  if (notes.length > NOTES_MAX) {
    throw new Error(`notes exceeds ${NOTES_MAX} characters`);
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
    throw new Error("No current group");
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .eq("group_id", profile.current_group_id)
    .maybeSingle();

  if (restaurantError) {
    throw restaurantError;
  }

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const row: DiningRecordInsert = {
    restaurant_id: restaurantId,
    user_id: user.id,
    visit_date: visitDate,
    rating: input.rating,
    notes,
  };

  const { data, error } = await supabase
    .from("records")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create record");
  }

  return data;
}
