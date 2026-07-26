"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { MenuItem } from "@/src/services/menu-item";
import QuantityStepper, {
  QuantityAddButton,
} from "@/components/group-order/QuantityStepper";

type MenuBrowseListProps = {
  items: MenuItem[];
  /** Client-side name filter (case-insensitive). */
  searchQuery?: string;
  /**
   * When set, each row shows quantity controls.
   * Return 0 when the item is not yet in the order.
   */
  getQuantity?: (item: MenuItem) => number;
  onIncrement?: (item: MenuItem) => void;
  onDecrement?: (item: MenuItem) => void;
  busyMenuItemId?: string | null;
  controlsDisabled?: boolean;
  /**
   * When set, long-press copies the item name (browse mode only).
   * Not used when quantity controls are active.
   */
  onCopyItemName?: (name: string) => void;
};

const ALL_CATEGORY = "全部";
const DRAG_THRESHOLD_PX = 5;
const LONG_PRESS_MS = 480;
const MOVE_CANCEL_PX = 10;
const PRESS_FLASH_MS = 150;

function formatPrice(price: number | null): string {
  if (price === null) {
    return "—";
  }
  return `$${price}`;
}

/**
 * Read-only menu list with horizontally scrollable category chips.
 * Preserves display_order; chips filter without reordering.
 */
export default function MenuBrowseList({
  items,
  searchQuery = "",
  getQuantity,
  onIncrement,
  onDecrement,
  busyMenuItemId = null,
  controlsDisabled = false,
  onCopyItemName,
}: MenuBrowseListProps) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [flashItemId, setFlashItemId] = useState<string | null>(null);
  const chipScrollRef = useRef<HTMLDivElement | null>(null);

  const isDraggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  const longPressTimerRef = useRef<number | null>(null);
  const longPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressFiredRef = useRef(false);
  const flashTimerRef = useRef<number | null>(null);

  const searchableItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const item of searchableItems) {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        ordered.push(item.category);
      }
    }
    return ordered;
  }, [searchableItems]);

  useEffect(() => {
    const el = chipScrollRef.current;
    if (!el) {
      return;
    }

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) {
        return;
      }
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) {
        return;
      }
      el.scrollLeft += event.deltaY;
      event.preventDefault();
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [categories.length, searchableItems.length]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current != null) {
        window.clearTimeout(longPressTimerRef.current);
      }
      if (flashTimerRef.current != null) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const visibleItems =
    selectedCategory === ALL_CATEGORY ||
    !categories.includes(selectedCategory)
      ? searchableItems
      : searchableItems.filter((item) => item.category === selectedCategory);

  const activeCategory =
    selectedCategory === ALL_CATEGORY ||
    !categories.includes(selectedCategory)
      ? ALL_CATEGORY
      : selectedCategory;

  const showControls = Boolean(getQuantity && onIncrement && onDecrement);
  const quickCopyEnabled = Boolean(onCopyItemName) && !showControls;

  function clearLongPressTimer() {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartRef.current = null;
  }

  function flashItem(itemId: string) {
    setFlashItemId(itemId);
    if (flashTimerRef.current != null) {
      window.clearTimeout(flashTimerRef.current);
    }
    flashTimerRef.current = window.setTimeout(() => {
      setFlashItemId(null);
      flashTimerRef.current = null;
    }, PRESS_FLASH_MS);
  }

  async function copyItemName(item: MenuItem) {
    const name = item.name.trim();
    if (!name || !onCopyItemName) {
      return;
    }

    try {
      await navigator.clipboard.writeText(name);
      flashItem(item.id);
      onCopyItemName(name);
    } catch {
      // Clipboard may be blocked; still give light feedback.
      flashItem(item.id);
    }
  }

  function handleItemPointerDown(
    event: ReactPointerEvent<HTMLLIElement>,
    item: MenuItem,
  ) {
    if (!quickCopyEnabled) {
      return;
    }
    // Ignore secondary buttons / multi-touch.
    if (event.button !== 0) {
      return;
    }

    longPressFiredRef.current = false;
    longPressStartRef.current = { x: event.clientX, y: event.clientY };
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      longPressFiredRef.current = true;
      void copyItemName(item);
    }, LONG_PRESS_MS);
  }

  function handleItemPointerMove(event: ReactPointerEvent<HTMLLIElement>) {
    if (!quickCopyEnabled || !longPressStartRef.current) {
      return;
    }
    const dx = event.clientX - longPressStartRef.current.x;
    const dy = event.clientY - longPressStartRef.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      clearLongPressTimer();
    }
  }

  function handleItemPointerEnd() {
    clearLongPressTimer();
  }

  function scrollByStep(direction: 1 | -1) {
    const el = chipScrollRef.current;
    if (!el) {
      return;
    }
    el.scrollBy({
      left: direction * Math.max(el.clientWidth * 0.6, 120),
      behavior: "smooth",
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const el = chipScrollRef.current;
    if (!el) {
      return;
    }
    isDraggingRef.current = true;
    draggedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = el.scrollLeft;
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const el = chipScrollRef.current;
    if (!isDraggingRef.current || !el) {
      return;
    }
    const delta = event.clientX - dragStartXRef.current;
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      draggedRef.current = true;
    }
    el.scrollLeft = dragStartScrollRef.current - delta;
  }

  function endDrag() {
    isDraggingRef.current = false;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-12 text-center shadow-soft">
        <p className="text-sm text-cocoa/70">尚未新增菜單品項</p>
        <p className="text-xs text-cocoa/50">可至菜單管理匯入</p>
      </div>
    );
  }

  if (searchableItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-rice-white/70 px-4 py-12 text-center shadow-soft">
        <p className="text-sm text-cocoa/70">找不到符合的品項</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {canScrollLeft ? (
          <button
            type="button"
            aria-label="向左瀏覽分類"
            onClick={() => scrollByStep(-1)}
            className="absolute top-1/2 left-0 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-rice-white/95 text-cocoa shadow-card transition-transform active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : null}

        <div
          ref={chipScrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          className={`flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-1 select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            canScrollLeft || canScrollRight
              ? "cursor-grab active:cursor-grabbing"
              : ""
          }`}
        >
          {[ALL_CATEGORY, ...categories].map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  if (draggedRef.current) {
                    return;
                  }
                  setSelectedCategory(category);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors active:scale-[0.98] ${
                  active
                    ? "bg-caramel text-rice-white shadow-button"
                    : "border border-border bg-cream-bg/60 text-deep-brown hover:bg-cream-bg"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {canScrollRight ? (
          <button
            type="button"
            aria-label="向右瀏覽分類"
            onClick={() => scrollByStep(1)}
            className="absolute top-1/2 right-0 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-rice-white/95 text-cocoa shadow-card transition-transform active:scale-95"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : null}

        {canScrollRight ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-cream-bg to-transparent"
          />
        ) : null}
        {canScrollLeft ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-cream-bg to-transparent"
          />
        ) : null}
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        {visibleItems.map((item) => {
          const quantity = getQuantity?.(item) ?? 0;
          const busy = busyMenuItemId === item.id;
          const flashing = flashItemId === item.id;
          return (
            <li
              key={item.id}
              onPointerDown={(event) => handleItemPointerDown(event, item)}
              onPointerMove={handleItemPointerMove}
              onPointerUp={handleItemPointerEnd}
              onPointerLeave={handleItemPointerEnd}
              onPointerCancel={handleItemPointerEnd}
              onContextMenu={(event) => {
                if (quickCopyEnabled) {
                  event.preventDefault();
                }
              }}
              className={`flex items-center justify-between gap-3 px-4 py-3 transition-[transform,background-color] duration-150 ${
                quickCopyEnabled ? "select-none touch-manipulation" : ""
              } ${
                flashing
                  ? "scale-[0.985] bg-sakura-pink/40"
                  : "bg-transparent scale-100"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-deep-brown">
                  {item.name}
                </p>
                {activeCategory === ALL_CATEGORY ? (
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {item.category}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 font-mono text-sm text-cocoa">
                {formatPrice(item.price)}
              </p>
              {showControls ? (
                quantity > 0 ? (
                  <QuantityStepper
                    quantity={quantity}
                    disabled={controlsDisabled || busy}
                    onDecrement={() => onDecrement?.(item)}
                    onIncrement={() => onIncrement?.(item)}
                  />
                ) : (
                  <QuantityAddButton
                    busy={busy}
                    disabled={controlsDisabled}
                    onClick={() => onIncrement?.(item)}
                  />
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
