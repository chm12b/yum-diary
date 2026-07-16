import type { Json } from "@/src/types/database";

export type RestaurantOpenStatus = "open" | "closed" | "holiday" | "unknown";

type BusinessHoursShape = {
  periods?: Array<{ open?: string; close?: string }>;
  closedDays?: string[];
};

// getDay(): 0 = Sunday … 6 = Saturday, mapped to the labels stored in business_hours.
const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

function toMinutes(value: string | undefined): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec((value ?? "").trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Derive the display open status from a restaurant's business_hours jsonb.
 * Read-only: does not touch the business-hours parser or the restaurant service.
 *
 * - Missing / empty business_hours → "unknown" (never defaults to closed).
 * - Today listed in closedDays → "holiday".
 * - Current time inside a period (overnight-aware) → "open", otherwise "closed".
 * - Closed days known but no periods → "unknown" (hours are undetermined).
 */
export function resolveOpenStatus(
  value: Json | null,
  now: Date = new Date(),
): RestaurantOpenStatus {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "unknown";
  }

  const hours = value as BusinessHoursShape;
  const periods = (hours.periods ?? []).filter(
    (period) => (period.open ?? "").trim() !== "" || (period.close ?? "").trim() !== "",
  );
  const closedDays = (hours.closedDays ?? []).filter(
    (day) => day.trim().length > 0,
  );

  if (periods.length === 0 && closedDays.length === 0) {
    return "unknown";
  }

  const todayLabel = WEEKDAY_LABELS[now.getDay()];
  if (closedDays.includes(todayLabel)) {
    return "holiday";
  }

  if (periods.length === 0) {
    return "unknown";
  }

  const current = now.getHours() * 60 + now.getMinutes();
  for (const period of periods) {
    const open = toMinutes(period.open);
    const close = toMinutes(period.close);
    if (open == null || close == null || open === close) {
      continue;
    }
    if (close > open) {
      if (current >= open && current < close) {
        return "open";
      }
    } else if (current >= open || current < close) {
      // Overnight period (e.g. 22:00 - 02:00).
      return "open";
    }
  }

  return "closed";
}
