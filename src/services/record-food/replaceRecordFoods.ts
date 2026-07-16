import { createClient } from "@/src/lib/supabase/client";

import { toRecordFood } from "./map";
import { normalizeFoodNames } from "./normalize";
import type { RecordFood, RecordFoodInsert } from "./types";

/**
 * Replace all ordered foods for a record (DELETE + INSERT).
 * Blank entries are ignored. Returns the new list (may be empty).
 */
export async function replaceRecordFoods(
  recordId: string,
  foods: string[],
): Promise<RecordFood[]> {
  const id = recordId.trim();
  if (!id) {
    throw new Error("Missing required field: recordId");
  }

  const names = normalizeFoodNames(foods);
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

  const { error: deleteError } = await supabase
    .from("record_foods")
    .delete()
    .eq("record_id", id);

  if (deleteError) {
    throw deleteError;
  }

  if (names.length === 0) {
    return [];
  }

  const rows: RecordFoodInsert[] = names.map((name, index) => ({
    record_id: id,
    name,
    display_order: index + 1,
    created_by: user.id,
  }));

  const { data, error } = await supabase
    .from("record_foods")
    .insert(rows)
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toRecordFood);
}
