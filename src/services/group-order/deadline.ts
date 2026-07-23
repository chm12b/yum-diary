import { getGroupOrder } from "./getGroupOrder";
import type { GroupOrder } from "./types";
import { updateGroupOrder } from "./updateGroupOrder";

export function isGroupOrderPastDeadline(order: GroupOrder): boolean {
  const closeAt = new Date(order.closeAt).getTime();
  if (Number.isNaN(closeAt)) {
    return false;
  }
  return Date.now() >= closeAt;
}

/**
 * If status is OPEN and now >= close_at, persist CLOSED and return the updated row.
 */
export async function ensureGroupOrderDeadlineClosed(
  order: GroupOrder,
): Promise<GroupOrder> {
  if (order.status === "OPEN" && isGroupOrderPastDeadline(order)) {
    return updateGroupOrder({ id: order.id, status: "CLOSED" });
  }
  return order;
}

export function assertGroupOrderAcceptsEdits(order: GroupOrder): void {
  if (order.status !== "OPEN" || isGroupOrderPastDeadline(order)) {
    throw new Error("Group order is not open");
  }
}

/**
 * Load order, auto-close if past deadline, then assert edits are allowed.
 */
export async function requireWritableGroupOrder(
  groupOrderId: string,
): Promise<GroupOrder> {
  const order = await getGroupOrder(groupOrderId);
  if (!order) {
    throw new Error("Group order not found");
  }
  const resolved = await ensureGroupOrderDeadlineClosed(order);
  assertGroupOrderAcceptsEdits(resolved);
  return resolved;
}
