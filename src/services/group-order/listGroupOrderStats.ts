import { createClient } from "@/src/lib/supabase/client";

export type GroupOrderStats = {
  participantCount: number;
  itemCount: number;
  totalAmount: number;
};

function emptyStats(): GroupOrderStats {
  return {
    participantCount: 0,
    itemCount: 0,
    totalAmount: 0,
  };
}

/**
 * Batch participant / item / amount stats for hub & history cards.
 */
export async function listGroupOrderStats(
  groupOrderIds: string[],
): Promise<Map<string, GroupOrderStats>> {
  const ids = [...new Set(groupOrderIds.map((id) => id.trim()).filter(Boolean))];
  const result = new Map<string, GroupOrderStats>(
    ids.map((id) => [id, emptyStats()]),
  );

  if (ids.length === 0) {
    return result;
  }

  const supabase = createClient();

  const { data: participants, error: participantsError } = await supabase
    .from("group_order_participants")
    .select("id, group_order_id")
    .in("group_order_id", ids);

  if (participantsError) {
    throw participantsError;
  }

  const participantToOrder = new Map<string, string>();
  for (const row of participants ?? []) {
    participantToOrder.set(row.id, row.group_order_id);
    const stats = result.get(row.group_order_id) ?? emptyStats();
    stats.participantCount += 1;
    result.set(row.group_order_id, stats);
  }

  const participantIds = [...participantToOrder.keys()];
  if (participantIds.length === 0) {
    return result;
  }

  const { data: items, error: itemsError } = await supabase
    .from("group_order_items")
    .select("participant_id, menu_item_id, quantity")
    .in("participant_id", participantIds);

  if (itemsError) {
    throw itemsError;
  }

  const rows = items ?? [];
  if (rows.length === 0) {
    return result;
  }

  const menuItemIds = [...new Set(rows.map((row) => row.menu_item_id))];
  const { data: menuRows, error: menuError } = await supabase
    .from("menu_items")
    .select("id, price")
    .in("id", menuItemIds);

  if (menuError) {
    throw menuError;
  }

  const priceById = new Map(
    (menuRows ?? []).map((row) => [
      row.id,
      row.price == null ? 0 : Number(row.price),
    ]),
  );

  for (const row of rows) {
    const orderId = participantToOrder.get(row.participant_id);
    if (!orderId) {
      continue;
    }
    const stats = result.get(orderId) ?? emptyStats();
    const quantity = Number(row.quantity) || 0;
    const unitPrice = priceById.get(row.menu_item_id) ?? 0;
    stats.itemCount += quantity;
    stats.totalAmount += unitPrice * quantity;
    result.set(orderId, stats);
  }

  return result;
}
