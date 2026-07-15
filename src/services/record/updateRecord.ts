import { createClient } from "@/src/lib/supabase/client";

import type { DiningRecord, UpdateRecordInput } from "./types";

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
 * Update a dining record owned by the signed-in user.
 * Throws on validation / auth / database errors.
 */
export async function updateRecord(
  recordId: string,
  input: UpdateRecordInput,
): Promise<DiningRecord> {
  const id = requireTrimmed(recordId, "recordId");
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

  const { data, error } = await supabase
    .from("records")
    .update({
      visit_date: visitDate,
      rating: input.rating,
      notes,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Record not found");
  }

  return data;
}
