"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { HeroImage } from "@/src/lib/restaurant-types";

type HeroGalleryProps = {
  images: HeroImage[];
  fallbackAlt: string;
};

export default function HeroGallery({ images, fallbackAlt }: HeroGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const container = scrollRef.current;

    if (!container || container.clientWidth === 0) {
      return;
    }

    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveIndex(index);
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-[4/3] w-full shrink-0 snap-center snap-always"
            >
              <Image
                src={image.url}
                alt={image.alt ?? fallbackAlt}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        <span className="absolute right-3 bottom-3 rounded-full bg-deep-brown/70 px-2.5 py-1 text-xs text-white">
          {activeIndex + 1}/{images.length}
        </span>
      </div>
      <div className="min-h-10" />
    </section>
  );
}
