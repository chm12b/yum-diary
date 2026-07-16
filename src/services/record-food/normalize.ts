import { RECORD_FOOD_NAME_MAX, RECORD_FOODS_MAX } from "./types";

/** Trim, drop blanks, enforce per-item and total limits. */
export function normalizeFoodNames(foods: string[]): string[] {
  return foods
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .slice(0, RECORD_FOODS_MAX)
    .map((name) => name.slice(0, RECORD_FOOD_NAME_MAX));
}
