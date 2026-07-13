import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function AddDiaryBunnyHero() {
  return (
    <section className="relative px-5 pt-1 pb-3">
      <div className="relative flex min-h-[130px] items-end justify-between">
        <Image
          src={homeAssets.addDiaryWord}
          alt="記錄美好的味道時光吧！"
          width={320}
          height={114}
          aria-hidden
          className="relative z-10 ml-2.5 mb-[25px] h-auto w-[14rem] object-contain"
        />

        <Image
          src={homeAssets.addDiaryBunny}
          alt=""
          width={140}
          height={140}
          aria-hidden
          className="pointer-events-none -mt-2 h-[120px] w-auto object-contain"
        />
      </div>

      <Image
        src={homeAssets.memoHeart}
        alt=""
        width={16}
        height={16}
        aria-hidden
        className="pointer-events-none absolute top-2 right-16 h-4 w-4 object-contain opacity-80"
      />
    </section>
  );
}
