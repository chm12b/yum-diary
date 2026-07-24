import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import PaperCard from "@/components/ui/PaperCard";
import { homeAssets } from "@/src/lib/home-assets";

type EntryCardProps = {
  href: string;
  label: string;
  subtitle?: string;
  iconSrc?: string;
  iconWidth?: 80 | 110;
  leading?: ReactNode;
};

/** Keep text column aligned across cards; wider icons compensate with more negative margin. */
const iconLayoutClass = {
  80: "h-[70px] w-[80px] -ml-[10px] -mr-[20px]",
  110: "h-[70px] w-[110px] -ml-[30px] -mr-[30px]",
} as const;

export default function EntryCard({
  href,
  label,
  subtitle,
  iconSrc,
  iconWidth = 80,
  leading,
}: EntryCardProps) {
  return (
    <Link href={href} className="block transition-transform active:scale-[0.98]">
      <PaperCard className="flex h-[90px] items-center gap-4 px-5 py-5">
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            width={iconWidth}
            height={70}
            aria-hidden
            className={`${iconLayoutClass[iconWidth]} shrink-0 object-contain`}
          />
        ) : leading ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl leading-none">
            {leading}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-text-primary">
            {label}
          </span>
          {subtitle ? (
            <span className="mt-1 block text-sm text-text-secondary">
              {subtitle}
            </span>
          ) : null}
        </span>
        <Image
          src={homeAssets.entryArrow}
          alt=""
          width={28}
          height={28}
          aria-hidden
          className="h-7 w-7 shrink-0 object-contain"
        />
      </PaperCard>
    </Link>
  );
}
