import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function RestaurantPageHeader() {
  return (
    <section className="relative px-5 pt-1 pb-3">
      <Image
        src={homeAssets.titleAllRestaurants}
        alt="餐廳列表"
        width={280}
        height={80}
        priority
        className="h-auto w-[220px] max-w-[75%] object-contain"
      />
      <Image
        src={homeAssets.searchBunny}
        alt=""
        width={120}
        height={120}
        aria-hidden
        className="pointer-events-none absolute -top-1 right-3 h-[110px] w-auto object-contain"
      />
    </section>
  );
}
