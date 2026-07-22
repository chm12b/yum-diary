import type { GroupOrder, GroupOrderRecord, GroupOrderStatus } from "./types";
import { GROUP_ORDER_STATUSES } from "./types";

export function isGroupOrderStatus(value: string): value is GroupOrderStatus {
  return (GROUP_ORDER_STATUSES as readonly string[]).includes(value);
}

export function toGroupOrder(row: GroupOrderRecord): GroupOrder {
  const status = isGroupOrderStatus(row.status) ? row.status : "OPEN";

  return {
    id: row.id,
    groupId: row.group_id,
    restaurantId: row.restaurant_id,
    title: row.title,
    description: row.description,
    status,
    closeAt: row.close_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
