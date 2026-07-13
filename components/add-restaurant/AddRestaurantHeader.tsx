"use client";

import { ArrowLeft, Ellipsis } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { homeAssets } from "@/src/lib/home-assets";

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

type AddRestaurantHeaderProps = {
  title?: string;
};

export default function AddRestaurantHeader({
  title = "新增餐廳",
}: AddRestaurantHeaderProps) {
  const router = useRouter();

  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <button
        type="button"
        aria-label="返回上一頁"
        onClick={() => router.back()}
        className={`${iconButtonClass} justify-self-start`}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <div className="flex items-center justify-center gap-1.5">
        <Image
          src={homeAssets.storeMyRec}
          alt=""
          width={20}
          height={20}
          aria-hidden
          className="h-5 w-5 object-contain"
        />
        <h1 className="font-display text-base font-bold text-deep-brown">
          {title}
        </h1>
      </div>
      <button
        type="button"
        aria-label="更多"
        className={`${iconButtonClass} justify-self-end`}
      >
        <Ellipsis className="h-5 w-5" strokeWidth={2} />
      </button>
    </header>
  );
}
