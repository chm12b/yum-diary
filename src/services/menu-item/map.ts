import type { MenuItem, MenuItemRecord } from "./types";

/** Map a DB row to the UI menu item model. */
export function toMenuItem(row: MenuItemRecord): MenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    category: row.category,
    name: row.name,
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
