import { createClient } from "@/src/lib/supabase/client";

/**
 * Batch restaurant display names by id (current group RLS applies).
 */
export async function listRestaurantNamesByIds(
  restaurantIds: string[],
): Promise<Map<string, string>> {
  const ids = [
    ...new Set(restaurantIds.map((id) => id.trim()).filter(Boolean)),
  ];
  if (ids.length === 0) {
    return new Map();
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name")
    .in("id", ids);

  if (error) {
    throw error;
  }

  return new Map(
    (data ?? []).map((row) => [row.id, row.name?.trim() || "未知餐廳"]),
  );
}
