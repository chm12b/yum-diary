import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function OnboardingFooter() {
  return (
    <footer className="mt-12 w-full px-0 pb-6">
      <Image
        src={homeAssets.welcomeBottom}
        alt="你的第一間收藏餐廳，會是哪一家呢？"
        width={1000}
        height={720}
        className="-mt-[30px] mx-auto h-auto w-full object-contain"
      />
    </footer>
  );
}
