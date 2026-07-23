import type { Database } from "@/src/types/database";

export type GroupOrderItemRecord =
  Database["public"]["Tables"]["group_order_items"]["Row"];

export type GroupOrderItemInsert =
  Database["public"]["Tables"]["group_order_items"]["Insert"];

export type GroupOrderItemUpdate =
  Database["public"]["Tables"]["group_order_items"]["Update"];

/** UI-facing group order item (camelCase) with menu snapshot fields. */
export type GroupOrderItem = {
  id: string;
  participantId: string;
  menuItemId: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  menuItemName: string;
  unitPrice: number | null;
};

export type CreateOrderItemInput = {
  groupOrderId: string;
  menuItemId: string;
  quantity?: number;
  note?: string | null;
};

export type UpdateOrderItemInput = {
  id: string;
  quantity?: number;
  note?: string | null;
};

export type DeleteOrderItemInput = {
  id: string;
};

export const GROUP_ORDER_ITEM_NOTE_MAX = 200;
