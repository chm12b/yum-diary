import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

type DecideHeroPhotoProps = {
  imageUrl: string;
  alt: string;
};

export default function DecideHeroPhoto({ imageUrl, alt }: DecideHeroPhotoProps) {
  return (
    <section className="-mt-5 -mb-[10px] px-5 pt-2.5 pb-3">
      <div className="relative mx-[53px] w-[250px]">
        <Image
          src={homeAssets.washiTapePink}
          alt=""
          width={80}
          height={32}
          aria-hidden
          className="pointer-events-none absolute top-[-18px] left-[34px] z-10 h-20 w-[5rem] -ml-[45px] -rotate-[36deg] object-contain"
        />
        <Image
          src={homeAssets.washiTapeKhaki}
          alt=""
          width={80}
          height={80}
          aria-hidden
          className="pointer-events-none absolute top-[135px] left-[225px] z-10 h-20 w-20 -rotate-[20deg] object-contain"
        />

        <div className="ml-[25px] w-[250px] -rotate-[3deg] rounded-2xl border-[3px] border-white bg-white p-2 shadow-card">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 28rem) 85vw, 18.5rem"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
