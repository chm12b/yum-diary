import { lineTotal, type GroupOrderItem } from "@/src/services/group-order-item";

export type SummaryMenuGroup = {
  menuItemId: string;
  name: string;
  displayOrder: number;
  totalQuantity: number;
  totalAmount: number;
};

export type BuildOrderSummaryInput = {
  items: GroupOrderItem[];
};

/**
 * Group order items by menu_item, sorted by menu display_order.
 * Aggregates quantity and amount only — no per-participant breakdown.
 */
export function buildOrderSummaryGroups(
  input: BuildOrderSummaryInput,
): SummaryMenuGroup[] {
  const groups = new Map<string, SummaryMenuGroup>();

  for (const item of input.items) {
    const existing = groups.get(item.menuItemId);
    if (!existing) {
      groups.set(item.menuItemId, {
        menuItemId: item.menuItemId,
        name: item.menuItemName,
        displayOrder: item.displayOrder,
        totalQuantity: item.quantity,
        totalAmount: lineTotal(item),
      });
      continue;
    }

    existing.totalQuantity += item.quantity;
    existing.totalAmount += lineTotal(item);
  }

  const result = Array.from(groups.values());

  result.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name, "zh-Hant");
  });

  return result;
}

/** Plain-text order for clipboard (店家送單用). */
export function buildOrderSummaryCopyText(input: {
  title: string;
  restaurantName: string;
  groups: SummaryMenuGroup[];
  totalCups: number;
  totalAmount: number;
}): string {
  const title = input.title.trim() || "揪團點餐";
  const restaurantName = input.restaurantName.trim() || "—";
  const lines = input.groups.map(
    (group) => `${group.name} ×${group.totalQuantity}`,
  );

  return [
    `🍽 ${title}｜${restaurantName}`,
    "────────────",
    ...lines,
    "────────────",
    `總杯數：${input.totalCups} 杯`,
    `總金額：$${input.totalAmount}`,
  ].join("\n");
}
