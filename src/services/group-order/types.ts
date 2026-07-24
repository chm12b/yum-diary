import type { Database } from "@/src/types/database";

export type GroupOrderStatus = "OPEN" | "CLOSED" | "COMPLETED";

export type GroupOrderRecord =
  Database["public"]["Tables"]["group_orders"]["Row"];

export type GroupOrderInsert =
  Database["public"]["Tables"]["group_orders"]["Insert"];

export type GroupOrderUpdate =
  Database["public"]["Tables"]["group_orders"]["Update"];

/** UI-facing group order (camelCase). */
export type GroupOrder = {
  id: string;
  groupId: string;
  restaurantId: string;
  title: string;
  description: string | null;
  status: GroupOrderStatus;
  closeAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type CreateGroupOrderInput = {
  groupId: string;
  restaurantId: string;
  title: string;
  description?: string | null;
  closeAt: string | Date;
};

export type UpdateGroupOrderInput = {
  id: string;
  title?: string;
  description?: string | null;
  status?: GroupOrderStatus;
  closeAt?: string | Date;
};

export const GROUP_ORDER_TITLE_MAX = 100;
export const GROUP_ORDER_DESCRIPTION_MAX = 500;

export const GROUP_ORDER_STATUSES: readonly GroupOrderStatus[] = [
  "OPEN",
  "CLOSED",
  "COMPLETED",
] as const;
