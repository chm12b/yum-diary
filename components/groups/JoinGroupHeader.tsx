"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { homeAssets } from "@/src/lib/home-assets";

export default function JoinGroupHeader() {
  const router = useRouter();

  return (
    <header className="w-full px-6 pt-6">
      <button
        type="button"
        aria-label="返回上一頁"
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-deep-brown shadow-soft transition-transform active:scale-[0.98]"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="mt-6 w-full">
        <Image
          src={homeAssets.joinGroupTop}
          alt="加入群組 — 輸入邀請碼加入美食地圖"
          width={837}
          height={398}
          priority
          className="mx-auto h-auto w-full object-contain"
        />
      </div>
    </header>
  );
}
