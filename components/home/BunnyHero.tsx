import Image from "next/image";

import PrimaryButton from "@/components/ui/PrimaryButton";
import { homeAssets } from "@/src/lib/home-assets";

export default function BunnyHero() {
  return (
    <section className="flex flex-col gap-4 px-5 pt-2">
      <div className="relative h-[250px] w-full">
        <Image
          src={homeAssets.bunnyDesk}
          alt="兔兔書桌場景"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 28rem) 100vw, 28rem"
        />
      </div>
      <div className="flex flex-col items-center">
        <PrimaryButton
          href="/decide"
          title="幫我決定"
          iconSrc={homeAssets.iconDice}
          trailingIconSrc={homeAssets.entryArrow}
        />
        <p className="mt-3 text-center text-sm text-text-secondary">
          讓兔兔幫你決定 ❤️
        </p>
      </div>
    </section>
  );
}
