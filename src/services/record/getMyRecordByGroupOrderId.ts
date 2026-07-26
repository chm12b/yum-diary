import { createClient } from "@/src/lib/supabase/client";

import type { DiningRecord } from "./types";

/**
 * Find the signed-in user's dining record linked to a group order.
 * Match key: group_order_id + user_id (owner). Returns null when none.
 */
export async function getMyRecordByGroupOrderId(
  groupOrderId: string,
): Promise<DiningRecord | null> {
  const id = groupOrderId.trim();
  if (!id) {
    return null;
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
    .select("*")
    .eq("group_order_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
