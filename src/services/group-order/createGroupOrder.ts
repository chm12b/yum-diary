import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrder } from "./map";
import {
  normalizeCloseAt,
  normalizeDescription,
  normalizeTitle,
} from "./normalize";
import type {
  CreateGroupOrderInput,
  GroupOrder,
  GroupOrderInsert,
} from "./types";

/**
 * Create a group order (Host). Status defaults to OPEN.
 */
export async function createGroupOrder(
  input: CreateGroupOrderInput,
): Promise<GroupOrder> {
  const groupId = input.groupId?.trim() ?? "";
  const restaurantId = input.restaurantId?.trim() ?? "";
  if (!groupId) {
    throw new Error("Missing required field: groupId");
  }
  if (!restaurantId) {
    throw new Error("Missing required field: restaurantId");
  }

  const title = normalizeTitle(input.title);
  if (!title) {
    throw new Error("Missing required field: title");
  }

  const closeAt = normalizeCloseAt(input.closeAt);
  const description = normalizeDescription(input.description);

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

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, group_id")
    .eq("id", restaurantId)
    .maybeSingle();

  if (restaurantError) {
    throw restaurantError;
  }
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }
  if (restaurant.group_id !== groupId) {
    throw new Error("Restaurant does not belong to this group");
  }

  const row: GroupOrderInsert = {
    group_id: groupId,
    restaurant_id: restaurantId,
    title,
    description,
    status: "OPEN",
    close_at: closeAt,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("group_orders")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to create group order");
  }

  return toGroupOrder(data);
}
