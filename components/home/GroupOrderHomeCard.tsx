"use client";

import Image from "next/image";
import Link from "next/link";

import PaperCard from "@/components/ui/PaperCard";
import { homeAssets } from "@/src/lib/home-assets";
import { useCurrentGroup } from "@/src/hooks/useCurrentGroup";

function GroupOrderCardShell({ disabled }: { disabled: boolean }) {
  return (
    <PaperCard
      className={`flex items-center gap-4 px-5 py-5 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <Image
        src={homeAssets.iconGroupOrder}
        alt=""
        width={80}
        height={48}
        aria-hidden
        className="h-12 w-[80px] shrink-0 object-contain -ml-[10px] -mr-[22px]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium text-text-primary">
          揪團點餐
        </span>
        <span className="mt-1 block text-sm text-text-secondary">
          查看目前點餐與歷史紀錄。
        </span>
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
  );
}

/**
 * Home entry for group orders — always opens Orders Hub (/orders).
 * Status (OPEN / CLOSED / History) is shown only on the Hub.
 */
export default function GroupOrderHomeCard() {
  const { currentGroupId, loading: groupLoading } = useCurrentGroup();

  if (groupLoading) {
    return (
      <div
        className="h-[88px] w-full animate-pulse rounded-[1.25rem] bg-border/80"
        aria-hidden
      />
    );
  }

  if (!currentGroupId) {
    return (
      <div aria-disabled="true">
        <GroupOrderCardShell disabled />
      </div>
    );
  }

  return (
    <Link
      href="/orders"
      className="block transition-transform active:scale-[0.98]"
    >
      <GroupOrderCardShell disabled={false} />
    </Link>
  );
}
