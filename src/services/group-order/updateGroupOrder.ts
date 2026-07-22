import { createClient } from "@/src/lib/supabase/client";

import { toGroupOrder } from "./map";
import {
  normalizeCloseAt,
  normalizeDescription,
  normalizeStatus,
  normalizeTitle,
} from "./normalize";
import type {
  GroupOrder,
  GroupOrderUpdate,
  UpdateGroupOrderInput,
} from "./types";

/**
 * Update fields on an existing group order.
 */
export async function updateGroupOrder(
  input: UpdateGroupOrderInput,
): Promise<GroupOrder> {
  const id = input.id?.trim() ?? "";
  if (!id) {
    throw new Error("Missing required field: id");
  }

  const patch: GroupOrderUpdate = {};

  if (input.title !== undefined) {
    const title = normalizeTitle(input.title);
    if (!title) {
      throw new Error("Missing required field: title");
    }
    patch.title = title;
  }

  if (input.description !== undefined) {
    patch.description = normalizeDescription(input.description);
  }

  if (input.status !== undefined) {
    const status = normalizeStatus(input.status);
    if (!status) {
      throw new Error("Invalid status");
    }
    patch.status = status;
  }

  if (input.closeAt !== undefined) {
    patch.close_at = normalizeCloseAt(input.closeAt);
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No fields to update");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("group_orders")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Failed to update group order");
  }

  return toGroupOrder(data);
}
