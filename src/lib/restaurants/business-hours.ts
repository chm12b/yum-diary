/**
 * Helpers for restaurants.business_hours (periods + closedDays).
 */

import type {
  BusinessHoursPeriod,
  BusinessHoursPeriodRow,
} from "@/src/lib/google/places/types";

export const MAX_BUSINESS_HOUR_PERIODS = 5;

export function createEmptyPeriod(): BusinessHoursPeriod {
  return { open: "", close: "" };
}

export function createEmptyPeriodRow(): BusinessHoursPeriodRow {
  return {
    id: crypto.randomUUID(),
    ...createEmptyPeriod(),
  };
}

export function toPeriodRows(
  periods: BusinessHoursPeriod[],
): BusinessHoursPeriodRow[] {
  return periods.map((period) => ({
    id: crypto.randomUUID(),
    open: period.open,
    close: period.close,
  }));
}
