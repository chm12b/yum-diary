import { createMenuItem } from "./createMenuItem";
import { deleteMenuItemsByRestaurant } from "./deleteMenuItemsByRestaurant";
import type { MenuImportJsonItem } from "./parseMenuImportJson";

export type ImportMenuItemsInput = {
  restaurantId: string;
  items: MenuImportJsonItem[];
  /** When true, delete existing items first. */
  overwrite: boolean;
};

/**
 * Import validated menu JSON items via createMenuItem().
 * display_order follows JSON order as 1..N (schema requires >= 1).
 */
export async function importMenuItemsFromJson(
  input: ImportMenuItemsInput,
): Promise<number> {
  const restaurantId = input.restaurantId.trim();
  if (!restaurantId) {
    throw new Error("Missing required field: restaurantId");
  }

  if (input.items.length === 0) {
    throw new Error("沒有可匯入的品項。");
  }

  if (input.overwrite) {
    await deleteMenuItemsByRestaurant(restaurantId);
  }

  for (let index = 0; index < input.items.length; index += 1) {
    const item = input.items[index];
    if (!item) {
      continue;
    }

    await createMenuItem({
      restaurantId,
      category: item.category,
      name: item.name,
      price: item.price,
      // Schema / normalize require display_order >= 1 (JSON order 0 → 1).
      displayOrder: index + 1,
    });
  }

  return input.items.length;
}
