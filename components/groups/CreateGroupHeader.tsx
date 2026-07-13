"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function CreateGroupHeader() {
  return (
    <header className="w-full px-6 pt-6">
      <button
        type="button"
        aria-label="返回上一頁"
        onClick={() => {}}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-deep-brown shadow-soft transition-transform active:scale-[0.98]"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="mt-6 w-full">
        <Image
          src={homeAssets.createGroupTop}
          alt="建立群組 — 開始建立你的美食地圖"
          width={847}
          height={404}
          priority
          className="mx-auto h-auto w-full object-contain"
        />
      </div>
    </header>
  );
}
