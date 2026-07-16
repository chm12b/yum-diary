"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { MenuPhoto } from "@/src/services/menu-photo";

type MenuGalleryProps = {
  photos: MenuPhoto[];
  restaurantName: string;
  onSelect: (index: number) => void;
};

const DRAG_THRESHOLD_PX = 5;

/**
 * Horizontal menu album with mouse affordances: prev/next arrows, vertical
 * wheel translated to horizontal scroll, and click-and-drag panning. A small
 * drag threshold distinguishes a drag from a tap so taps still open the photo.
 */
export default function MenuGallery({
  photos,
  restaurantName,
  onSelect,
}: MenuGalleryProps) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isDraggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  const setScrollRef = useCallback((element: HTMLDivElement | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    const el = node;
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

    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [node]);

  function scrollByStep(direction: 1 | -1) {
    if (!node) {
      return;
    }
    node.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!node) {
      return;
    }
    isDraggingRef.current = true;
    draggedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = node.scrollLeft;
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current || !node) {
      return;
    }
    const delta = event.clientX - dragStartXRef.current;
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      draggedRef.current = true;
    }
    node.scrollLeft = dragStartScrollRef.current - delta;
  }

  function endDrag() {
    isDraggingRef.current = false;
  }

  return (
    <div className="relative">
      {canScrollLeft ? (
        <button
          type="button"
          aria-label="上一張"
          onClick={() => scrollByStep(-1)}
          className="absolute left-1 top-[68px] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-rice-white/90 text-cocoa shadow-card transition-transform active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
      ) : null}

      <div
        ref={setScrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={`flex gap-3 overflow-x-auto pb-1 select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          canScrollLeft || canScrollRight
            ? "cursor-grab active:cursor-grabbing"
            : ""
        }`}
      >
        {photos.map((photo, index) => (
          <div key={photo.id} className="w-28 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (draggedRef.current) {
                  return;
                }
                onSelect(index);
              }}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-rice-white shadow-soft transition-transform active:scale-[0.98]"
            >
              <Image
                src={photo.url}
                alt={`${restaurantName} 菜單 ${index + 1}`}
                fill
                sizes="112px"
                className="object-cover"
                draggable={false}
                unoptimized
              />
            </button>
            <p className="mt-1.5 text-center text-xs text-cocoa">
              菜單 {index + 1}
            </p>
          </div>
        ))}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          aria-label="下一張"
          onClick={() => scrollByStep(1)}
          className="absolute right-1 top-[68px] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-rice-white/90 text-cocoa shadow-card transition-transform active:scale-95"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}
