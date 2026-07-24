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
 * Resolve and persist derived group-order status.
 * Currently: OPEN past close_at → CLOSED.
 * Extension point for future automatic status transitions.
 */
export async function ensureGroupOrderStatus(
  order: GroupOrder,
): Promise<GroupOrder> {
  if (order.status === "OPEN" && isGroupOrderPastDeadline(order)) {
    return updateGroupOrder({ id: order.id, status: "CLOSED" });
  }
  return order;
}

/** @deprecated Prefer {@link ensureGroupOrderStatus}. */
export async function ensureGroupOrderDeadlineClosed(
  order: GroupOrder,
): Promise<GroupOrder> {
  return ensureGroupOrderStatus(order);
}

export function assertGroupOrderAcceptsEdits(order: GroupOrder): void {
  if (order.status !== "OPEN" || isGroupOrderPastDeadline(order)) {
    throw new Error("Group order is not open");
  }
}

/**
 * Load order, resolve status (e.g. auto-close), then assert edits are allowed.
 */
export async function requireWritableGroupOrder(
  groupOrderId: string,
): Promise<GroupOrder> {
  const order = await getGroupOrder(groupOrderId);
  if (!order) {
    throw new Error("Group order not found");
  }
  const resolved = await ensureGroupOrderStatus(order);
  assertGroupOrderAcceptsEdits(resolved);
  return resolved;
}
