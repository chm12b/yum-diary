"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import SectionHeading from "@/components/restaurants/detail/SectionHeading";
import { homeAssets } from "@/src/lib/home-assets";

const menuPlaceholder = "/restaurants/menu-placeholder.svg";

type MenuSectionProps = {
  menuImages: string[];
  alt: string;
  onImageClick?: (index: number) => void;
};

export default function MenuSection({
  menuImages,
  alt,
  onImageClick,
}: MenuSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const images = menuImages.length > 0 ? menuImages : [menuPlaceholder];

  function handleScroll() {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const cardWidth = container.firstElementChild?.clientWidth ?? 0;
    const gap = 12;

    if (cardWidth === 0) {
      return;
    }

    const index = Math.round(container.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, images.length - 1));
  }

  return (
    <section className="px-5 pt-5">
      <SectionHeading
        iconSrc={homeAssets.storeMenu}
        title="菜單（點擊可放大）"
        iconSize={50}
        className="-mt-[10px] -mb-[2px] flex items-center gap-2"
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="w-28 shrink-0 snap-center">
            <button
              type="button"
              onClick={() => onImageClick?.(index)}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-rice-white shadow-soft"
            >
              <Image
                src={image}
                alt={`${alt} 菜單 ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
            <p className="mt-1.5 text-center text-xs text-cocoa">
              菜單 {index + 1}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {images.map((_, index) => (
          <span
            key={index}
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${
              index === activeIndex ? "bg-sakura-pink" : "bg-border"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
