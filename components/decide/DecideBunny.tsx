import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function DecideBunny() {
  return (
    <section className="px-5 pt-1 pb-2">
      <Image
        src={homeAssets.diceBunny}
        alt=""
        width={280}
        height={160}
        aria-hidden
        priority
        className="mx-auto h-[160px] w-[280px] object-contain"
      />
    </section>
  );
}
