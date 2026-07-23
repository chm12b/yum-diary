import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrderParticipant } from "./map";
import type { GroupOrderParticipant } from "./types";

/**
 * List participants for a group order, ordered by joined_at ascending.
 * Returns [] when the id is blank.
 */
export async function listParticipants(
  groupOrderId: string,
): Promise<GroupOrderParticipant[]> {
  const id = groupOrderId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("group_order_participants")
    .select("*")
    .eq("group_order_id", id)
    .order("joined_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toGroupOrderParticipant);
}
