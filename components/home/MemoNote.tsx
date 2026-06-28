import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function MemoNote() {
  return (
    <div className="relative rounded-2xl border border-dashed border-border bg-rice-white/90 px-4 py-5">
      <Image
        src={homeAssets.washiTapePink}
        alt=""
        width={48}
        height={20}
        aria-hidden
        className="absolute -top-2.5 left-8 h-5 w-12 object-cover"
      />
      <Image
        src={homeAssets.washiTapeKhaki}
        alt=""
        width={48}
        height={20}
        aria-hidden
        className="absolute -top-2.5 right-12 h-5 w-12 object-cover"
      />
      <Image
        src={homeAssets.memoBunny}
        alt=""
        width={28}
        height={28}
        aria-hidden
        className="absolute -bottom-2 left-4"
      />
      <Image
        src={homeAssets.memoHeart}
        alt=""
        width={24}
        height={24}
        aria-hidden
        className="absolute -bottom-1 right-6"
      />
      <p className="text-center font-display text-sm leading-relaxed text-text-primary">
        記得吃飯，記得開心！❤️
      </p>
    </div>
  );
}
