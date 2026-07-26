"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  RefreshCw,
  Share2,
} from "lucide-react";

import { homeAssets } from "@/src/lib/home-assets";
import type { GroupOrderStatus } from "@/src/services/group-order";

type GroupOrderSummaryCardProps = {
  title: string;
  restaurantId: string;
  restaurantName: string;
  status: GroupOrderStatus;
  deadlineLabel: string;
  participantCount: number;
  itemCount: number;
  estimatedTotal: number;
  onOpenOverview?: () => void;
};

export default function GroupOrderSummaryCard({
  title,
  restaurantId,
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
              <Link
                href={`/restaurants/${restaurantId}`}
                aria-label={`前往 ${restaurantName} 餐廳詳情`}
                className="mt-0.5 flex max-w-full cursor-pointer items-center gap-1 text-left text-sm text-text-secondary transition-colors hover:text-caramel active:opacity-80"
              >
                <MapPin
                  className="h-3.5 w-3.5 shrink-0 text-sakura-pink"
                  strokeWidth={2.5}
                />
                <span className="min-w-0 truncate">{restaurantName}</span>
                <Image
                  src={homeAssets.entryArrow}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden
                  className="h-4 w-4 shrink-0 object-contain"
                />
              </Link>
            </div>

            <button
              type="button"
              onClick={onOpenOverview}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-milk-tea/80 px-2.5 py-1.5 text-xs font-bold text-[#6E4F38] shadow-soft transition-colors hover:bg-milk-tea active:scale-[0.98]"
            >
              <span aria-hidden>📋</span>
              訂單總覽
            </button>
          </div>

          {status === "OPEN" ? (
            <>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-status-open-bg px-2 py-0.5 text-[11px] font-bold tracking-wide text-status-open-fg">
                  OPEN
                </span>
                <span className="text-sm font-medium text-[#6E4F38]">
                  🟢 點餐中
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
            </>
          ) : null}

          {status === "CLOSED" ? (
            <div className="mt-2.5">
              <p className="text-sm font-bold text-[#6E4F38]">
                🔴 點餐已截止
              </p>
              <p className="mt-0.5 text-sm text-text-secondary">
                目前無法修改餐點。
              </p>
            </div>
          ) : null}

          {status === "COMPLETED" ? (
            <div className="mt-2.5">
              <p className="text-sm font-bold text-[#6E4F38]">
                ✅ 訂單已完成
              </p>
              <p className="mt-0.5 text-sm text-text-secondary">謝謝大家！</p>
            </div>
          ) : null}
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
  onRefresh,
  refreshing = false,
}: {
  onShare?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const router = useRouter();

  return (
    <header className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 px-5 pt-4 pb-3">
      <button
        type="button"
        aria-label="返回點餐首頁"
        onClick={() => router.push("/orders")}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white text-[#6E4F38] shadow-soft"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <h1 className="text-center font-display text-base font-bold text-[#6E4F38]">
        揪團點餐
      </h1>
      <div className="flex items-center gap-1.5 justify-self-end">
        {onShare ? (
          <button
            type="button"
            aria-label="分享"
            onClick={onShare}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white text-[#6E4F38] shadow-soft"
          >
            <Share2 className="h-4 w-4" strokeWidth={2.2} />
          </button>
        ) : null}
        {onRefresh ? (
          <button
            type="button"
            aria-label="重新整理"
            disabled={refreshing}
            onClick={onRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white text-[#6E4F38] shadow-soft disabled:opacity-70"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={2.2}
            />
          </button>
        ) : (
          <span className="h-9 w-9" aria-hidden />
        )}
      </div>
    </header>
  );
}
