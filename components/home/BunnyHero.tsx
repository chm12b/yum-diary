import Image from "next/image";

import PrimaryButton from "@/components/ui/PrimaryButton";
import { homeAssets } from "@/src/lib/home-assets";

export default function BunnyHero() {
  return (
    <section className="flex flex-col gap-4 px-5 pt-2">
      <div className="relative h-[260px] w-full">
        <Image
          src={homeAssets.bunnyDesk}
          alt="兔兔書桌場景"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 28rem) 100vw, 28rem"
        />
      </div>
      <PrimaryButton
        title="幫我決定"
        subtitle="讓兔兔幫你挑選吧～"
        iconSrc={homeAssets.iconDice}
        trailingIconSrc={homeAssets.entryArrow}
      />
    </section>
  );
}
