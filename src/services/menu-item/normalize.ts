import {
  MENU_ITEM_CATEGORY_MAX,
  MENU_ITEM_DEFAULT_CATEGORY,
  MENU_ITEM_NAME_MAX,
} from "./types";

export function normalizeCategory(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return MENU_ITEM_DEFAULT_CATEGORY;
  }
  return trimmed.slice(0, MENU_ITEM_CATEGORY_MAX);
}

export function normalizeName(value: string | null | undefined): string {
  return (value?.trim() ?? "").slice(0, MENU_ITEM_NAME_MAX);
}

export function normalizePrice(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid price");
  }
  return value;
}

export function normalizeDisplayOrder(value: number | undefined): number {
  if (value === undefined) {
    return 1;
  }
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("Invalid displayOrder");
  }
  return value;
}
