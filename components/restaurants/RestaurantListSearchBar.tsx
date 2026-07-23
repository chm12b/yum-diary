"use client";

import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react";

type RestaurantListSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onOpenFilter: () => void;
  onToggleSort: () => void;
  filterActive?: boolean;
  sortOpen?: boolean;
};

export default function RestaurantListSearchBar({
  value,
  onChange,
  onOpenFilter,
  onToggleSort,
  filterActive = false,
  sortOpen = false,
}: RestaurantListSearchBarProps) {
  return (
    <div className="flex h-12 items-center gap-1 rounded-full border border-border bg-rice-white pl-4 pr-1.5 shadow-soft">
      <Search
        className="h-5 w-5 shrink-0 text-text-secondary"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜尋餐廳、料理或地點..."
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent px-2 text-base text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
      />
      <button
        type="button"
        aria-label="篩選"
        aria-pressed={filterActive}
        onClick={onOpenFilter}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
          filterActive
            ? "bg-sakura-pink text-deep-brown"
            : "text-cocoa hover:bg-cream-bg"
        }`}
      >
        <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="排序"
        aria-expanded={sortOpen}
        onClick={onToggleSort}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
          sortOpen
            ? "bg-sakura-pink text-deep-brown"
            : "text-cocoa hover:bg-cream-bg"
        }`}
      >
        <ArrowUpDown className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}
