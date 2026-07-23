import type { RestaurantFilter } from "@/src/services/restaurant";
import type { RestaurantOpenStatus } from "@/src/lib/restaurants/open-status";
import type { RestaurantSort } from "@/src/services/restaurant";

export const OPEN_STATUS_OPTIONS: Array<{
  value: RestaurantOpenStatus;
  label: string;
}> = [
  { value: "open", label: "營業中" },
  { value: "closed", label: "已打烊" },
  { value: "holiday", label: "公休" },
  { value: "unknown", label: "未提供" },
];

export const DISTANCE_FILTER_OPTIONS: Array<{
  value: number;
  label: string;
  chipLabel: string;
}> = [
  { value: 1000, label: "1 公里內", chipLabel: "📏 1 公里內" },
  { value: 3000, label: "3 公里內", chipLabel: "📏 3 公里內" },
  { value: 5000, label: "5 公里內", chipLabel: "📏 5 公里內" },
];

/** Chip / fallback label for any maxDistanceMeters value. */
export function formatDistanceFilterChipLabel(meters: number): string {
  if (meters < 1000) {
    return `📏 ${meters} 公尺內`;
  }
  const km = meters / 1000;
  const kmLabel = Number.isInteger(km) ? String(km) : String(Number(km.toFixed(1)));
  return `📏 ${kmLabel} 公里內`;
}

export const SORT_OPTIONS: Array<{
  value: RestaurantSort;
  label: string;
}> = [
  { value: "distance", label: "📏 距離最近" },
  { value: "newest", label: "🆕 最近新增" },
  { value: "name", label: "🔤 名稱 A-Z" },
  { value: "rating_desc", label: "⭐ Google 評分（高→低）" },
  { value: "rating_asc", label: "⭐ Google 評分（低→高）" },
];

export type FilterChipItem = {
  key: keyof RestaurantFilter;
  label: string;
};

export function buildFilterChips(
  filter: RestaurantFilter,
): FilterChipItem[] {
  const chips: FilterChipItem[] = [];

  if (filter.maxDistanceMeters != null && filter.maxDistanceMeters > 0) {
    const distanceOption = DISTANCE_FILTER_OPTIONS.find(
      (option) => option.value === filter.maxDistanceMeters,
    );
    chips.push({
      key: "maxDistanceMeters",
      label:
        distanceOption?.chipLabel ??
        formatDistanceFilterChipLabel(filter.maxDistanceMeters),
    });
  }
  if (filter.city?.trim()) {
    chips.push({ key: "city", label: `📍 ${filter.city.trim()}` });
  }
  if (filter.district?.trim()) {
    chips.push({ key: "district", label: `🏘 ${filter.district.trim()}` });
  }
  if (filter.category?.trim()) {
    chips.push({ key: "category", label: `🍜 ${filter.category.trim()}` });
  }
  if (filter.openStatus) {
    const statusLabel =
      OPEN_STATUS_OPTIONS.find((option) => option.value === filter.openStatus)
        ?.label ?? filter.openStatus;
    chips.push({ key: "openStatus", label: `🟢 ${statusLabel}` });
  }

  return chips;
}

export function hasActiveFilter(filter: RestaurantFilter): boolean {
  return buildFilterChips(filter).length > 0;
}

export function clearFilterKey(
  filter: RestaurantFilter,
  key: keyof RestaurantFilter,
): RestaurantFilter {
  const next = { ...filter };
  delete next[key];
  if (key === "city") {
    delete next.district;
  }
  return next;
}
