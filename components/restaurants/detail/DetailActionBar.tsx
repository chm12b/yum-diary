"use client";

import { Heart, MapPin, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { homeAssets } from "@/src/lib/home-assets";

type DetailActionBarProps = {
  restaurantId: string;
  isFavorite: boolean;
  isFavoriteLoading: boolean;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  onToggleFavorite: () => void;
  onToast: (message: string) => void;
};

const outlineButtonClass =
  "flex shrink-0 items-center justify-center gap-1 rounded-xl border border-border bg-rice-white px-3 py-2.5 text-xs font-medium text-deep-brown shadow-soft";

function hasFiniteCoord(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export default function DetailActionBar({
  restaurantId,
  isFavorite,
  isFavoriteLoading,
  latitude,
  longitude,
  address,
  onToggleFavorite,
  onToast,
}: DetailActionBarProps) {
  function handleNavigate() {
    if (hasFiniteCoord(latitude) && hasFiniteCoord(longitude)) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    const trimmedAddress = address?.trim();
    if (trimmedAddress) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedAddress)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    onToast("目前沒有可導航的位置資訊。");
  }

  return (
    <section className="-mt-[10px] px-5 pt-4 pb-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isFavoriteLoading}
          onClick={onToggleFavorite}
          className={`${outlineButtonClass} w-[4.5rem]`}
          aria-pressed={isFavorite}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-sakura-pink text-caramel" : "text-cocoa"
            }`}
            strokeWidth={2}
          />
          收藏
        </button>
        <button
          type="button"
          onClick={handleNavigate}
          className={`${outlineButtonClass} w-[4.5rem]`}
        >
          <MapPin className="h-4 w-4 text-cocoa" strokeWidth={2} />
          導航
        </button>
        <div className="relative min-w-0 flex-1">
          <Link
            href={`/restaurants/${restaurantId}/records/new`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sakura-pink pr-8 text-[15px] font-bold tracking-[1px] text-deep-brown shadow-pink-button"
          >
            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            新增美食日記
          </Link>
          <Image
            src={homeAssets.stickerFlowerPink}
            alt=""
            width={35}
            height={60}
            aria-hidden
            className="pointer-events-none absolute -right-1 top-1/2 mt-[-1px] mr-[5px] h-[60px] w-[35px] -translate-y-1/2 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
