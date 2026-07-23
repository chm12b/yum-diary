import type { GroupOrderItem, GroupOrderItemRecord } from "./types";

export function toGroupOrderItem(
  row: GroupOrderItemRecord,
  menu?: { name: string; price: number | null } | null,
): GroupOrderItem {
  return {
    id: row.id,
    participantId: row.participant_id,
    menuItemId: row.menu_item_id,
    quantity: row.quantity,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    menuItemName: menu?.name?.trim() || "未知品項",
    unitPrice: menu?.price == null ? null : Number(menu.price),
  };
}

export function lineTotal(item: GroupOrderItem): number {
  return (item.unitPrice ?? 0) * item.quantity;
}
