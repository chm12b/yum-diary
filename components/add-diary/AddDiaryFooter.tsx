import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function AddDiaryFooter() {
  return (
    <section className="space-y-3 px-5 pt-2 pb-8">
      <button
        type="button"
        className="relative flex w-full items-center justify-center gap-2 rounded-full bg-caramel px-6 py-3.5 text-base font-bold text-rice-white shadow-button transition-transform active:scale-[0.98]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1.5 rounded-full border border-dashed border-rice-white/60"
        />
        <Image
          src={homeAssets.memoBunny}
          alt=""
          width={80}
          height={80}
          aria-hidden
          className="-mx-2.5 -my-[25px] h-20 w-20 object-contain"
        />
        儲存日記
        <Image
          src={homeAssets.navFavorites}
          alt=""
          width={30}
          height={30}
          aria-hidden
          className="h-[30px] w-[30px] rotate-[15deg] object-contain"
        />
      </button>

      <p className="flex items-center justify-center gap-1 text-center text-xs text-text-secondary">
        🔒 只有你看得到這篇日記喔！
        <Image
          src={homeAssets.memoHeart}
          alt=""
          width={14}
          height={14}
          aria-hidden
          className="h-3.5 w-3.5 object-contain"
        />
      </p>
    </section>
  );
}
