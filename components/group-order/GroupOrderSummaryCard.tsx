"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  MoreHorizontal,
  Share2,
} from "lucide-react";

import { homeAssets } from "@/src/lib/home-assets";
import type { GroupOrderStatus } from "@/src/services/group-order";

type GroupOrderSummaryCardProps = {
  title: string;
  restaurantName: string;
  status: GroupOrderStatus;
  deadlineLabel: string;
  participantCount: number;
  itemCount: number;
  estimatedTotal: number;
  onOpenOverview?: () => void;
};

const STATUS_TEXT: Record<GroupOrderStatus, string> = {
  OPEN: "點餐中",
  CLOSED: "已截止",
  COMPLETED: "已完成",
};

export default function GroupOrderSummaryCard({
  title,
  restaurantName,
  status,
  deadlineLabel,
  participantCount,
  itemCount,
  estimatedTotal,
  onOpenOverview,
}: GroupOrderSummaryCardProps) {
  return (
    <section className="h-[200px] rounded-[1.5rem] border border-border bg-rice-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <Image
          src={homeAssets.groupOrderBunny}
          alt=""
          width={100}
          height={100}
          aria-hidden
          className="mt-0.5 h-[100px] w-[100px] shrink-0 object-contain"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-bold leading-tight text-[#6E4F38]">
                {title}
              </h2>
              <p className="mt-0.5 truncate text-sm text-text-secondary">
                {restaurantName}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenOverview}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-milk-tea/80 px-2.5 py-1.5 text-xs font-bold text-[#6E4F38] shadow-soft transition-colors hover:bg-milk-tea active:scale-[0.98]"
            >
              <ClipboardList className="h-3.5 w-3.5" strokeWidth={2.2} />
              訂單總覽
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide ${
                status === "OPEN"
                  ? "bg-status-open-bg text-status-open-fg"
                  : status === "CLOSED"
                    ? "bg-status-closed-bg text-status-closed-fg"
                    : "bg-status-unknown-bg text-status-unknown-fg"
              }`}
            >
              {status}
            </span>
            <span className="text-sm font-medium text-[#6E4F38]">
              {STATUS_TEXT[status]}
            </span>
          </div>

          <p className="mt-2 flex items-center gap-1 text-sm text-text-secondary">
            <span aria-hidden>🕒</span>
            <span>
              截止時間：
              <span className="font-semibold text-soft-orange">
                {deadlineLabel}
              </span>
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-border/80 border-t border-dashed border-border pt-3">
        <div className="-mt-2.5 px-1 py-1 text-center">
          <p className="text-[11px] text-text-secondary">👥 參與人數</p>
          <p className="mt-1 font-display text-[15px] font-bold text-[#6E4F38]">
            {participantCount} 人
          </p>
        </div>
        <div className="px-1 py-1 text-center">
          <p className="-mt-2.5 text-[11px] text-text-secondary">🧋 品項總數</p>
          <p className="mt-1 font-display text-[15px] font-bold text-[#6E4F38]">
            {itemCount} 項
          </p>
        </div>
        <div className="px-1 py-1 text-center">
          <p className="-mt-2.5 text-[11px] text-text-secondary">💰 預估金額</p>
          <p className="mt-1 font-display text-[15px] font-bold text-soft-orange">
            $ {estimatedTotal}
          </p>
        </div>
      </div>
    </section>
  );
}

export function GroupOrderPageHeader({
  onShare,
  onMore,
}: {
  onShare?: () => void;
  onMore?: () => void;
}) {
  const router = useRouter();

  return (
    <header className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 px-5 pt-4 pb-3">
      <button
        type="button"
        aria-label="返回上一頁"
        onClick={() => router.back()}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white text-[#6E4F38] shadow-soft"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <h1 className="text-center font-display text-base font-bold text-[#6E4F38]">
        揪團點餐
      </h1>
      <div className="flex items-center gap-1.5 justify-self-end">
        <button
          type="button"
          aria-label="分享"
          onClick={onShare}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white text-[#6E4F38] shadow-soft"
        >
          <Share2 className="h-4 w-4" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="更多"
          onClick={onMore}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white text-[#6E4F38] shadow-soft"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
