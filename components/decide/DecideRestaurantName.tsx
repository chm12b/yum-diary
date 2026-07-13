import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

type DecideRestaurantNameProps = {
  name: string;
};

export default function DecideRestaurantName({ name }: DecideRestaurantNameProps) {
  return (
    <section className="relative -mb-[25px] px-5 pt-2 pb-4">
      <Image
        src={homeAssets.diceNameL}
        alt=""
        width={100}
        height={50}
        aria-hidden
        className="pointer-events-none absolute top-2 left-8 h-[50px] w-[100px] object-contain"
      />
      <Image
        src={homeAssets.diceNameR}
        alt=""
        width={40}
        height={40}
        aria-hidden
        className="pointer-events-none absolute top-0 right-10 h-9 w-9 object-contain"
      />

      <h2 className="text-center font-display text-[1.65rem] font-bold leading-tight text-deep-brown">
        {name}
      </h2>

      <Image
        src={homeAssets.diceNameM}
        alt=""
        width={200}
        height={24}
        aria-hidden
        className="mx-auto mt-2 h-10 w-[min(100%,250px)] object-contain"
      />
    </section>
  );
}
