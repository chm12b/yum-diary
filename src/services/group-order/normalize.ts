import {
  GROUP_ORDER_DESCRIPTION_MAX,
  GROUP_ORDER_TITLE_MAX,
  type GroupOrderStatus,
} from "./types";
import { isGroupOrderStatus } from "./map";

export function normalizeTitle(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, GROUP_ORDER_TITLE_MAX);
}

export function normalizeDescription(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim().slice(0, GROUP_ORDER_DESCRIPTION_MAX);
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeCloseAt(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid closeAt");
  }
  return date.toISOString();
}

export function normalizeStatus(
  value: string | null | undefined,
): GroupOrderStatus | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim().toUpperCase();
  return isGroupOrderStatus(trimmed) ? trimmed : null;
}
