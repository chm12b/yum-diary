import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrderParticipant } from "./map";
import type { GroupOrderParticipant } from "./types";

/**
 * Fetch the signed-in user's participant row for a group order.
 * Returns null when not joined / unauthenticated / inaccessible.
 */
export async function getMyParticipant(
  groupOrderId: string,
): Promise<GroupOrderParticipant | null> {
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
    return null;
  }

  const { data, error } = await supabase
    .from("group_order_participants")
    .select("*")
    .eq("group_order_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toGroupOrderParticipant(data) : null;
}
