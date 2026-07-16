import type { PostgrestError } from "@supabase/supabase-js";

import type { CreateRestaurantInput, Json } from "./types";

export function requireTrimmed(
  value: string | undefined | null,
  field: string,
): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new Error(`Missing required field: ${field}`);
  }
  return trimmed;
}

export function optionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

/**
 * True when a Postgres / PostgREST error is about one of the given columns not
 * existing. Lets writes degrade gracefully when a later migration (e.g. 009 /
 * 014) has not been applied to the database yet.
 */
export function isMissingColumnError(
  error: PostgrestError | null,
  columns: readonly string[],
): boolean {
  if (!error) {
    return false;
  }

  const message =
    `${error.message} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return columns.some((column) => message.includes(column.toLowerCase()));
}

export function normalizeBusinessHours(
  businessHours: CreateRestaurantInput["businessHours"],
): Json | null {
  if (!businessHours) {
    return null;
  }

  const periods = (businessHours.periods ?? [])
    .map((period) => ({
      open: period.open?.trim() ?? "",
      close: period.close?.trim() ?? "",
    }))
    .filter((period) => period.open !== "" || period.close !== "");

  const closedDays = (businessHours.closedDays ?? []).filter(
    (day) => day.trim().length > 0,
  );

  const hasFlags =
    businessHours.openAllYear === true ||
    businessHours.irregularHolidays === true;

  if (periods.length === 0 && closedDays.length === 0 && !hasFlags) {
    return null;
  }

  return {
    periods,
    closedDays,
    ...(businessHours.openAllYear !== undefined
      ? { openAllYear: businessHours.openAllYear }
      : {}),
    ...(businessHours.irregularHolidays !== undefined
      ? { irregularHolidays: businessHours.irregularHolidays }
      : {}),
  };
}
