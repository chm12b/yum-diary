import { createClient } from "@/src/lib/supabase/client";

/**
 * Batch food names by dining record.
 * Names preserve display_order ASC, then created_at ASC.
 */
export async function listRecordFoodsByRecordIds(
  recordIds: string[],
): Promise<Map<string, string[]>> {
  const ids = [...new Set(recordIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) {
    return new Map();
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("record_foods")
    .select("record_id, name, display_order, created_at")
    .in("record_id", ids)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const result = new Map<string, string[]>();
  for (const row of data ?? []) {
    const names = result.get(row.record_id) ?? [];
    names.push(row.name);
    result.set(row.record_id, names);
  }

  return result;
}
