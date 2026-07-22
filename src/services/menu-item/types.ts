import type { Database } from "@/src/types/database";

export type MenuItemRecord = Database["public"]["Tables"]["menu_items"]["Row"];

export type MenuItemInsert =
  Database["public"]["Tables"]["menu_items"]["Insert"];

export type MenuItemUpdate =
  Database["public"]["Tables"]["menu_items"]["Update"];

/** UI-facing menu item (camelCase). */
export type MenuItem = {
  id: string;
  restaurantId: string;
  category: string;
  name: string;
  price: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMenuItemInput = {
  restaurantId: string;
  category?: string | null;
  name: string;
  price?: number | null;
  displayOrder?: number;
};

export type UpdateMenuItemInput = {
  id: string;
  category?: string | null;
  name?: string;
  price?: number | null;
  displayOrder?: number;
};

export type DeleteMenuItemInput = {
  id: string;
};

/** Spec default when category cannot be inferred. */
export const MENU_ITEM_DEFAULT_CATEGORY = "其他";

export const MENU_ITEM_CATEGORY_MAX = 50;
export const MENU_ITEM_NAME_MAX = 100;
