import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function AddRestaurantBunnyHero() {
  return (
    <div className="relative mb-[-12px] shrink-0 self-end">
      <Image
        src={homeAssets.addDiaryBunny}
        alt=""
        width={140}
        height={140}
        aria-hidden
        className="pointer-events-none h-[110px] w-auto object-contain"
      />
      <Image
        src={homeAssets.memoHeart}
        alt=""
        width={14}
        height={14}
        aria-hidden
        className="pointer-events-none absolute top-1 right-2 h-3.5 w-3.5 object-contain opacity-80"
      />
    </div>
  );
}
