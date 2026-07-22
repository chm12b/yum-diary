import { MENU_ITEM_DEFAULT_CATEGORY } from "@/src/services/menu-item/types";

export type MenuImportJsonItem = {
  category: string;
  name: string;
  price: number | null;
};

export type MenuImportCategoryGroup = {
  category: string;
  items: MenuImportJsonItem[];
};

export type ParseMenuImportResult =
  | { ok: true; items: MenuImportJsonItem[] }
  | { ok: false; message: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePrice(value: unknown): number | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return undefined;
}

/**
 * Parse + validate AI Menu Import JSON (AI_MENU_IMPORT_SPEC.md).
 * Does not invent items; only checks shape.
 */
export function parseMenuImportJson(raw: string): ParseMenuImportResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, message: "JSON 格式錯誤。" };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, message: "JSON 格式錯誤。" };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, message: "JSON 格式錯誤。" };
  }

  const items: MenuImportJsonItem[] = [];

  for (let index = 0; index < parsed.length; index += 1) {
    const entry = parsed[index];

    if (!isPlainObject(entry)) {
      return {
        ok: false,
        message: `第 ${index + 1} 筆品項格式錯誤。`,
      };
    }

    if (typeof entry.name !== "string" || !entry.name.trim()) {
      return {
        ok: false,
        message: `第 ${index + 1} 筆缺少有效的 name。`,
      };
    }

    const price = parsePrice(entry.price);
    if (price === undefined) {
      return {
        ok: false,
        message: `第 ${index + 1} 筆 price 必須為數字或 null。`,
      };
    }

    let category = MENU_ITEM_DEFAULT_CATEGORY;
    if (entry.category !== undefined && entry.category !== null) {
      if (typeof entry.category !== "string") {
        return {
          ok: false,
          message: `第 ${index + 1} 筆 category 必須為字串。`,
        };
      }
      category = entry.category.trim() || MENU_ITEM_DEFAULT_CATEGORY;
    }

    items.push({
      category,
      name: entry.name.trim(),
      price,
    });
  }

  return { ok: true, items };
}

/**
 * Group by category while preserving first-seen category order and item order.
 */
export function groupMenuImportByCategory(
  items: MenuImportJsonItem[],
): MenuImportCategoryGroup[] {
  const groups: MenuImportCategoryGroup[] = [];
  const indexByCategory = new Map<string, number>();

  for (const item of items) {
    const existing = indexByCategory.get(item.category);
    if (existing === undefined) {
      indexByCategory.set(item.category, groups.length);
      groups.push({ category: item.category, items: [item] });
      continue;
    }
    groups[existing]?.items.push(item);
  }

  return groups;
}
