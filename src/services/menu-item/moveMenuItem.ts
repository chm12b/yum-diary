import { listMenuItems } from "./listMenuItems";
import { updateMenuItem } from "./updateMenuItem";

/**
 * Swap display_order with the previous item (list order ASC).
 * No-op when already first.
 */
export async function moveMenuItemUp(
  restaurantId: string,
  itemId: string,
): Promise<void> {
  const id = itemId.trim();
  const restaurant = restaurantId.trim();
  if (!id || !restaurant) {
    throw new Error("Missing required fields");
  }

  const items = await listMenuItems(restaurant);
  const index = items.findIndex((item) => item.id === id);
  if (index <= 0) {
    return;
  }

  const current = items[index];
  const previous = items[index - 1];
  if (!current || !previous) {
    return;
  }

  const currentOrder = current.displayOrder;
  const previousOrder = previous.displayOrder;

  await Promise.all([
    updateMenuItem({ id: current.id, displayOrder: previousOrder }),
    updateMenuItem({ id: previous.id, displayOrder: currentOrder }),
  ]);
}

/**
 * Swap display_order with the next item (list order ASC).
 * No-op when already last.
 */
export async function moveMenuItemDown(
  restaurantId: string,
  itemId: string,
): Promise<void> {
  const id = itemId.trim();
  const restaurant = restaurantId.trim();
  if (!id || !restaurant) {
    throw new Error("Missing required fields");
  }

  const items = await listMenuItems(restaurant);
  const index = items.findIndex((item) => item.id === id);
  if (index < 0 || index >= items.length - 1) {
    return;
  }

  const current = items[index];
  const next = items[index + 1];
  if (!current || !next) {
    return;
  }

  const currentOrder = current.displayOrder;
  const nextOrder = next.displayOrder;

  await Promise.all([
    updateMenuItem({ id: current.id, displayOrder: nextOrder }),
    updateMenuItem({ id: next.id, displayOrder: currentOrder }),
  ]);
}
