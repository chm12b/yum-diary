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
  leading?: ReactNode;
};

export default function EntryCard({
  href,
  label,
  subtitle,
  iconSrc,
  leading,
}: EntryCardProps) {
  return (
    <Link href={href} className="block transition-transform active:scale-[0.98]">
      <PaperCard className="flex items-center gap-4 px-5 py-5">
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt=""
            width={80}
            height={48}
            aria-hidden
            className="h-12 w-[80px] shrink-0 object-contain -ml-[10px] -mr-[22px]"
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
