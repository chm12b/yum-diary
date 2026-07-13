"use client";

import { RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { homeAssets } from "@/src/lib/home-assets";

type DecideActionsProps = {
  restaurantId: string;
};

export default function DecideActions({ restaurantId }: DecideActionsProps) {
  return (
    <section className="space-y-3 px-5 pt-[15px] pb-8">
      <Link
        href={`/restaurants/${restaurantId}`}
        className="relative flex w-full items-center justify-center gap-2 rounded-full bg-caramel px-6 py-3.5 text-base font-bold text-rice-white shadow-button transition-transform active:scale-[0.98]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1.5 rounded-full border border-dashed border-rice-white/60"
        />
        <Image
          src={homeAssets.diceTryIcon}
          alt=""
          width={24}
          height={24}
          aria-hidden
          className="-ml-[25px] -mr-[15px] h-[30px] w-[50px] object-contain"
        />
        去看看
      </Link>

      <button
        type="button"
        onClick={() => {}}
        className="relative flex w-full items-center justify-center gap-2 rounded-full border border-border bg-rice-white px-6 py-3.5 text-base font-bold text-deep-brown shadow-soft transition-transform active:scale-[0.98]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1.5 rounded-full border border-dashed border-cocoa/40"
        />
        <RefreshCw className="h-5 w-5 text-cocoa" strokeWidth={2} />
        再抽一次
      </button>
    </section>
  );
}
