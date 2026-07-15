"use client";

import { ArrowLeft, Ellipsis } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { homeAssets } from "@/src/lib/home-assets";

type AddDiaryHeaderProps = {
  backHref: string;
  title: string;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

export default function AddDiaryHeader({
  backHref,
  title,
}: AddDiaryHeaderProps) {
  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <Link
        href={backHref}
        aria-label="返回"
        className={`${iconButtonClass} justify-self-start`}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </Link>
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
