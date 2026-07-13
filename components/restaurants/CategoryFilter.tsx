"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import CategoryChip from "@/components/restaurants/CategoryChip";
import type { CategoryFilterItem } from "@/src/lib/restaurant-types";

type CategoryFilterProps = {
  items: CategoryFilterItem[];
  value: string;
  onChange: (value: string) => void;
};

const SCROLL_EDGE_PX = 4;

export default function CategoryFilter({
  items,
  value,
  onChange,
}: CategoryFilterProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setCanScrollLeft(scrollLeft > SCROLL_EDGE_PX);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - SCROLL_EDGE_PX);
  }

  function scrollByPage(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    scroller.scrollBy({
      left: direction * Math.max(scroller.clientWidth * 0.7, 120),
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    updateScrollState();

    scroller.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [items]);

  return (
    <div className="flex min-w-0 items-center gap-1">
      <button
        type="button"
        aria-label="往前查看分類"
        disabled={!canScrollLeft}
        onClick={() => scrollByPage(-1)}
        className="flex h-9 w-8 shrink-0 items-center justify-center text-cocoa disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
      <div
        ref={scrollerRef}
        className="flex min-w-0 flex-1 touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <CategoryChip
            key={item.id}
            label={item.label}
            active={value === item.id}
            onClick={() => onChange(item.id)}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="往後查看分類"
        disabled={!canScrollRight}
        onClick={() => scrollByPage(1)}
        className="flex h-9 w-8 shrink-0 items-center justify-center text-cocoa disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
