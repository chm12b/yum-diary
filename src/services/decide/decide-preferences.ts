import { APP_CATEGORIES, type AppCategory } from "@/src/lib/restaurants/category";
import type {
  DecideDistanceKm,
  DecideFavoriteMode,
  DecideFilters,
} from "@/src/services/decide/decide.service";

const STORAGE_KEY = "yum-diary:decide-filters";

export const DEFAULT_DECIDE_FILTERS: DecideFilters = {
  onlyOpen: true,
  maxDistanceKm: 3,
  favoriteMode: "all",
  selectedCategories: [],
};

function isDecideDistanceKm(value: unknown): value is DecideDistanceKm {
  return value === null || value === 1 || value === 3 || value === 5;
}

function isDecideFavoriteMode(value: unknown): value is DecideFavoriteMode {
  return value === "all" || value === "favorites";
}

function isAppCategory(value: unknown): value is AppCategory {
  return (
    typeof value === "string" &&
    (APP_CATEGORIES as readonly string[]).includes(value)
  );
}

function parseSelectedCategories(value: unknown): AppCategory[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const categories: AppCategory[] = [];
  for (const item of value) {
    if (!isAppCategory(item)) {
      return null;
    }
    if (!categories.includes(item)) {
      categories.push(item);
    }
  }

  return categories;
}

/** Migrate legacy single-select `category` into multi-select. */
function migrateLegacyCategory(value: unknown): AppCategory[] | null {
  if (value === "all") {
    return [];
  }
  if (isAppCategory(value)) {
    return [value];
  }
  return null;
}

function parseDecideFilters(value: unknown): DecideFilters | null {
  if (value == null || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.onlyOpen !== "boolean") {
    return null;
  }
  if (!isDecideDistanceKm(record.maxDistanceKm)) {
    return null;
  }
  if (!isDecideFavoriteMode(record.favoriteMode)) {
    return null;
  }

  const selectedCategories =
    parseSelectedCategories(record.selectedCategories) ??
    migrateLegacyCategory(record.category);

  if (selectedCategories == null) {
    return null;
  }

  return {
    onlyOpen: record.onlyOpen,
    maxDistanceKm: record.maxDistanceKm,
    favoriteMode: record.favoriteMode,
    selectedCategories,
  };
}

export function loadDecidePreferences(): DecideFilters {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_DECIDE_FILTERS,
      selectedCategories: [...DEFAULT_DECIDE_FILTERS.selectedCategories],
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_DECIDE_FILTERS,
        selectedCategories: [...DEFAULT_DECIDE_FILTERS.selectedCategories],
      };
    }

    const parsed = parseDecideFilters(JSON.parse(raw) as unknown);
    return parsed
      ? parsed
      : {
          ...DEFAULT_DECIDE_FILTERS,
          selectedCategories: [...DEFAULT_DECIDE_FILTERS.selectedCategories],
        };
  } catch {
    return {
      ...DEFAULT_DECIDE_FILTERS,
      selectedCategories: [...DEFAULT_DECIDE_FILTERS.selectedCategories],
    };
  }
}

export function saveDecidePreferences(filters: DecideFilters): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

export function clearDecidePreferences(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore quota / private-mode failures during logout cleanup.
  }
}

export function sameSelectedCategories(
  a: readonly AppCategory[],
  b: readonly AppCategory[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((category, index) => category === b[index]);
}
