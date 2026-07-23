import { createClient } from "@/src/lib/supabase/client";

import { getMyParticipant } from "./getMyParticipant";
import { toGroupOrderParticipant } from "./map";
import type {
  CreateParticipantInput,
  GroupOrderParticipant,
  GroupOrderParticipantInsert,
} from "./types";

/**
 * Join a group order as the signed-in user.
 * Idempotent: if already joined, returns the existing row.
 */
export async function createParticipant(
  input: CreateParticipantInput,
): Promise<GroupOrderParticipant> {
  const groupOrderId = input.groupOrderId?.trim() ?? "";
  if (!groupOrderId) {
    throw new Error("Missing required field: groupOrderId");
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

  const existing = await getMyParticipant(groupOrderId);
  if (existing) {
    return existing;
  }

  const row: GroupOrderParticipantInsert = {
    group_order_id: groupOrderId,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("group_order_participants")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    // Race: another insert won UNIQUE (group_order_id, user_id).
    if (error.code === "23505") {
      const again = await getMyParticipant(groupOrderId);
      if (again) {
        return again;
      }
    }
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create participant");
  }

  return toGroupOrderParticipant(data);
}
