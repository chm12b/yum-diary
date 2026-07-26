import { createClient } from "@/src/lib/supabase/client";
import { listMyOrderItems } from "@/src/services/group-order-item";
import { getGroupOrder } from "@/src/services/group-order";

import { getMyRecordByGroupOrderId } from "./getMyRecordByGroupOrderId";
import type {
  CreateRecordInput,
  DiningRecord,
  DiningRecordInsert,
} from "./types";

const NOTES_MAX = 200;

export const DUPLICATE_GROUP_ORDER_RECORD_MESSAGE =
  "此共同點餐已建立過美食日記。";

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
 * Optional groupOrderId links the record to a completed group order.
 * Throws on validation / auth / database errors.
 */
export async function createRecord(
  input: CreateRecordInput,
): Promise<DiningRecord> {
  const restaurantId = requireTrimmed(input.restaurantId, "restaurantId");
  const visitDate = requireTrimmed(input.visitDate, "visitDate");
  const notes = requireTrimmed(input.notes, "notes");
  const groupOrderId = input.groupOrderId?.trim() || null;

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

  if (groupOrderId) {
    const order = await getGroupOrder(groupOrderId);
    if (!order) {
      throw new Error("Group order not found");
    }
    if (order.status !== "COMPLETED") {
      throw new Error("Group order is not completed");
    }
    if (order.restaurantId !== restaurantId) {
      throw new Error("Group order restaurant mismatch");
    }
    if (order.groupId !== profile.current_group_id) {
      throw new Error("Group order not in current group");
    }

    const existing = await getMyRecordByGroupOrderId(groupOrderId);
    if (existing) {
      throw new Error(DUPLICATE_GROUP_ORDER_RECORD_MESSAGE);
    }

    const myItems = await listMyOrderItems(groupOrderId);
    const hasOrdered = myItems.some((item) => item.quantity > 0);
    if (!hasOrdered) {
      throw new Error("No order items for current user");
    }
  }

  const row: DiningRecordInsert = {
    restaurant_id: restaurantId,
    user_id: user.id,
    visit_date: visitDate,
    rating: input.rating,
    notes,
    group_order_id: groupOrderId,
  };

  const { data, error } = await supabase
    .from("records")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(DUPLICATE_GROUP_ORDER_RECORD_MESSAGE);
    }
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create record");
  }

  return data;
}
