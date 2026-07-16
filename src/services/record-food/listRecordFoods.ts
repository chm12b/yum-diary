import { createClient } from "@/src/lib/supabase/client";

import { toRecordFood } from "./map";
import type { RecordFood } from "./types";

/**
 * List a diary record's ordered foods (display_order ASC, then created_at ASC).
 * Returns [] when the id is blank.
 */
export async function listRecordFoods(
  recordId: string,
): Promise<RecordFood[]> {
  const id = recordId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("record_foods")
    .select("*")
    .eq("record_id", id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toRecordFood);
}
