import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

type RecordsTitleSectionProps = {
  recordCount: number;
};

export default function RecordsTitleSection({
  recordCount,
}: RecordsTitleSectionProps) {
  return (
    <section className="relative px-5 pt-2 pb-5">
      <Image
        src={homeAssets.stickerFlowerPink}
        alt=""
        width={28}
        height={28}
        aria-hidden
        className="pointer-events-none absolute top-6 left-8 h-7 w-7 object-contain"
      />
      <Image
        src={homeAssets.stickerFlowerYellow}
        alt=""
        width={28}
        height={28}
        aria-hidden
        className="pointer-events-none absolute top-4 right-10 h-7 w-7 object-contain"
      />

      <Image
        src={homeAssets.diaryTitle}
        alt="美食日記"
        width={280}
        height={80}
        priority
        className="mx-auto h-auto w-[min(100%,16rem)] object-contain"
      />

      <p className="mt-2 flex items-center justify-center gap-1 text-sm text-cocoa">
        共 {recordCount} 筆紀錄
        <Image
          src={homeAssets.memoHeart}
          alt=""
          width={16}
          height={16}
          aria-hidden
          className="h-4 w-4 object-contain"
        />
      </p>
    </section>
  );
}
