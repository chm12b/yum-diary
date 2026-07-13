import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function OnboardingHeader() {
  return (
    <header className="w-full px-0 pt-6">
      <Image
        src={homeAssets.welcomeTop}
        alt="歡迎來到 Yum Diary — 今天開始，建立屬於你的美食地圖。"
        width={1000}
        height={720}
        priority
        className="-mt-[35px] mx-auto h-auto w-full object-contain"
      />
    </header>
  );
}
