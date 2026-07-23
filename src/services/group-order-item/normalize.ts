import { GROUP_ORDER_ITEM_NOTE_MAX } from "./types";

export function normalizeQuantity(value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) {
    return 1;
  }
  const n = Math.floor(value);
  return n >= 1 ? n : 1;
}

export function normalizeNote(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, GROUP_ORDER_ITEM_NOTE_MAX);
}
