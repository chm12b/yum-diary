import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function AuthHeader() {
  return (
    <header className="w-full max-w-[500px] px-0 pt-8 pb-2">
      <Image
        src={homeAssets.loginTop}
        alt="Yum Diary — 今天想吃什麼呢？"
        width={1000}
        height={580}
        priority
        className="-mt-5 mx-auto h-auto w-full max-w-[500px] object-contain"
      />
    </header>
  );
}
