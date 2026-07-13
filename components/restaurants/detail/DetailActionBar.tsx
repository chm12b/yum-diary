import { Heart, MapPin } from "lucide-react";
import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

type DetailActionBarProps = {
  isFavorite: boolean;
};

const outlineButtonClass =
  "flex shrink-0 items-center justify-center gap-1 rounded-xl border border-border bg-rice-white px-3 py-2.5 text-xs font-medium text-deep-brown shadow-soft";

export default function DetailActionBar({ isFavorite }: DetailActionBarProps) {
  return (
    <section className="-mt-[10px] px-5 pt-4 pb-6">
      <div className="flex items-center gap-2">
        <button type="button" className={`${outlineButtonClass} w-[4.5rem]`}>
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-sakura-pink text-caramel" : "text-cocoa"
            }`}
            strokeWidth={2}
          />
          收藏
        </button>
        <button type="button" className={`${outlineButtonClass} w-[4.5rem]`}>
          <MapPin className="h-4 w-4 text-cocoa" strokeWidth={2} />
          導航
        </button>
        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sakura-pink pr-8 text-lg font-bold tracking-[1px] text-deep-brown shadow-pink-button"
          >
            <Image
              src={homeAssets.diceEatThis}
              alt=""
              width={70}
              height={70}
              aria-hidden
              className="mt-[7px] ml-[5px] mr-[-10px] h-[70px] w-[70px] object-contain"
            />
            今晚吃這家！
          </button>
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
