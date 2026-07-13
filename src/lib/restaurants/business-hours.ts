/**
 * Helpers for restaurants.business_hours (periods + closedDays).
 */

import type {
  BusinessHoursPeriod,
  BusinessHoursPeriodRow,
} from "@/src/lib/google/places/types";
import type { OpeningHours } from "@/src/lib/restaurant-types";
import type { Json } from "@/src/types/database";

export const MAX_BUSINESS_HOUR_PERIODS = 5;

type BusinessHoursJson = {
  periods?: Array<{ open?: string; close?: string }>;
  closedDays?: string[];
  openAllYear?: boolean;
  irregularHolidays?: boolean;
};

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

/**
 * Parse restaurants.business_hours jsonb into OpeningHours for Detail UI.
 */
export function parseOpeningHours(value: Json | null): OpeningHours {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      slots: ["未設定"],
      todayStatusLabel: "",
      closedDays: [],
    };
  }

  const hours = value as BusinessHoursJson;
  const slots = (hours.periods ?? [])
    .map((period) => {
      const open = period.open?.trim() ?? "";
      const close = period.close?.trim() ?? "";
      if (!open && !close) {
        return null;
      }
      if (open && close) {
        return `${open} - ${close}`;
      }
      return open || close;
    })
    .filter((slot): slot is string => slot != null);

  const closedDays = (hours.closedDays ?? []).filter(
    (day) => day.trim().length > 0,
  );

  return {
    slots: slots.length > 0 ? slots : ["未設定"],
    todayStatusLabel: "",
    closedDays,
  };
}

/**
 * Parse restaurants.business_hours jsonb into editable form state.
 */
export function parseBusinessHoursForForm(value: Json | null): {
  periods: BusinessHoursPeriodRow[];
  closedDays: string[];
  openAllYear: boolean;
  irregularHolidays: boolean;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      periods: [createEmptyPeriodRow()],
      closedDays: [],
      openAllYear: false,
      irregularHolidays: false,
    };
  }

  const hours = value as BusinessHoursJson;
  const periods = (hours.periods ?? [])
    .map((period) => ({
      open: period.open?.trim() ?? "",
      close: period.close?.trim() ?? "",
    }))
    .filter((period) => period.open !== "" || period.close !== "");

  return {
    periods:
      periods.length > 0 ? toPeriodRows(periods) : [createEmptyPeriodRow()],
    closedDays: (hours.closedDays ?? []).filter((day) => day.trim().length > 0),
    openAllYear: hours.openAllYear === true,
    irregularHolidays: hours.irregularHolidays === true,
  };
}
