"use client";

import Image from "next/image";

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
  const images = menuImages.length > 0 ? menuImages : [menuPlaceholder];

  return (
    <section className="px-5 pt-4 pb-2">
      <h2 className="mb-3 text-base font-bold text-deep-brown">
        菜單（點圖可放大）
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => onImageClick?.(index)}
            className="relative aspect-[3/4] w-36 shrink-0 snap-center overflow-hidden rounded-xl bg-rice-white"
          >
            <Image
              src={image}
              alt={`${alt} 菜單 ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
