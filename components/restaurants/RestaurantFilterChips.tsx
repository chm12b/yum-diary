"use client";

import { X } from "lucide-react";

import type { FilterChipItem } from "@/src/lib/restaurants/filter-ui";
import type { RestaurantFilter } from "@/src/services/restaurant";

type RestaurantFilterChipsProps = {
  chips: FilterChipItem[];
  onRemove: (key: keyof RestaurantFilter) => void;
};

export default function RestaurantFilterChips({
  chips,
  onRemove,
}: RestaurantFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label="已套用篩選"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          role="listitem"
          onClick={() => onRemove(chip.key)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-caramel bg-sakura-pink px-3 py-1.5 text-sm font-medium text-deep-brown shadow-soft transition-colors hover:brightness-[0.98] active:scale-[0.98]"
        >
          <span>{chip.label}</span>
          <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="sr-only">移除</span>
        </button>
      ))}
    </div>
  );
}
