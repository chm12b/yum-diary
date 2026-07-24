import { createClient } from "@/src/lib/supabase/client";
import { getMyParticipant } from "@/src/services/group-order-participant";

import { toGroupOrderItem } from "./map";
import type { GroupOrderItem, GroupOrderItemRecord } from "./types";

async function attachMenuSnapshots(
  rows: GroupOrderItemRecord[],
): Promise<GroupOrderItem[]> {
  if (rows.length === 0) {
    return [];
  }

  const menuItemIds = [...new Set(rows.map((row) => row.menu_item_id))];
  const supabase = createClient();
  const { data: menuRows, error } = await supabase
    .from("menu_items")
    .select("id, name, price, display_order")
    .in("id", menuItemIds);

  if (error) {
    throw error;
  }

  const menuById = new Map(
    (menuRows ?? []).map((row) => [
      row.id,
      {
        name: row.name,
        price: row.price == null ? null : Number(row.price),
        displayOrder: row.display_order,
      },
    ]),
  );

  return rows.map((row) =>
    toGroupOrderItem(row, menuById.get(row.menu_item_id) ?? null),
  );
}

/**
 * List the signed-in user's order items for a group order (created_at ASC).
 */
export async function listMyOrderItems(
  groupOrderId: string,
): Promise<GroupOrderItem[]> {
  const id = groupOrderId.trim();
  if (!id) {
    return [];
  }

  const participant = await getMyParticipant(id);
  if (!participant) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("group_order_items")
    .select("*")
    .eq("participant_id", participant.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return attachMenuSnapshots(data ?? []);
}

/**
 * List all order items for a group order (created_at ASC).
 */
export async function listOrderItems(
  groupOrderId: string,
): Promise<GroupOrderItem[]> {
  const id = groupOrderId.trim();
  if (!id) {
    return [];
  }

  const supabase = createClient();

  const { data: participants, error: participantsError } = await supabase
    .from("group_order_participants")
    .select("id")
    .eq("group_order_id", id);

  if (participantsError) {
    throw participantsError;
  }

  const participantIds = (participants ?? []).map((row) => row.id);
  if (participantIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("group_order_items")
    .select("*")
    .in("participant_id", participantIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return attachMenuSnapshots(data ?? []);
}
