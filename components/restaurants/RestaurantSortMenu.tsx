"use client";

import { useEffect, useRef } from "react";

import { SORT_OPTIONS } from "@/src/lib/restaurants/filter-ui";
import type { RestaurantSort } from "@/src/services/restaurant";

type RestaurantSortMenuProps = {
  open: boolean;
  value: RestaurantSort;
  onClose: () => void;
  onChange: (sort: RestaurantSort) => void;
};

export default function RestaurantSortMenu({
  open,
  value,
  onClose,
  onChange,
}: RestaurantSortMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="關閉排序選單"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="menu"
        aria-label="排序方式"
        className="popover-enter absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(100%,16.5rem)] overflow-hidden rounded-2xl border border-border bg-rice-white py-1.5 shadow-card"
      >
        {SORT_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-deep-brown transition-colors hover:bg-milk-tea/70 active:bg-milk-tea"
            >
              <span className={selected ? "font-bold" : "font-medium"}>
                {option.label}
              </span>
              {selected ? (
                <span className="text-caramel" aria-hidden>
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
