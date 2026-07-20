import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import RecordStarRating from "@/components/records/RecordStarRating";
import SectionHeading from "@/components/restaurants/detail/SectionHeading";
import { homeAssets } from "@/src/lib/home-assets";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type MyRecordSectionProps = {
  restaurant: RestaurantDetail;
  status?: "loading" | "ready" | "error";
  onRetry?: () => void;
};

function formatVisitDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const w = weekdays[date.getDay()];

  return `${y} / ${m} / ${d} (${w})`;
}

function summarizeNotes(notes: string, maxLength = 80): string {
  const trimmed = notes.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function MyRecordSkeleton() {
  return (
    <div className="animate-pulse px-4 pt-5 pb-3" aria-hidden>
      <div className="flex gap-3">
        <div className="h-[80px] w-[110px] shrink-0 rounded-full bg-border/70" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-28 rounded-full bg-border/80" />
          <div className="h-4 w-20 rounded-full bg-border/60" />
        </div>
      </div>
      <div className="mt-3 h-12 w-3/4 rounded-xl bg-border/50" />
    </div>
  );
}

export default function MyRecordSection({
  restaurant,
  status = "ready",
  onRetry,
}: MyRecordSectionProps) {
  const { lastVisited, myRating, recordCount, records } = restaurant;
  const totalRecords = recordCount ?? records?.length ?? 0;
  const hasRecords = status === "ready" && totalRecords > 0;
  const latest = records?.[0];
  const latestPhoto = latest?.photo ?? null;
  const hasLatestPhoto = Boolean(latestPhoto);
  const notesSummary = latest?.notes
    ? summarizeNotes(latest.notes)
    : null;
  const rating = myRating ?? latest?.rating;

  return (
    <section className="px-5 pt-5 pb-4">
      <div className="relative -mt-[15px] -mb-[5px]">
        <Image
          src={homeAssets.washiTapeKhaki}
          alt=""
          width={80}
          height={50}
          aria-hidden
          className="pointer-events-none absolute top-[31px] right-[-17px] z-10 mb-[10px] h-[50px] w-[80px] rotate-[15deg] object-contain"
        />
        <SectionHeading
          iconSrc={homeAssets.storeMyRec}
          title="美食日記"
          iconSize={50}
          className="flex items-center gap-2"
        />
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        {status === "loading" ? <MyRecordSkeleton /> : null}

        {status === "error" ? (
          <div className="flex min-h-[7rem] flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <p className="text-sm text-cocoa">載入日記失敗</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-caramel px-5 py-2 text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98]"
              >
                重新整理
              </button>
            ) : null}
          </div>
        ) : null}

        {status === "ready" && hasRecords && latest ? (
          <Link
            href={`/records/${latest.id}`}
            className="block px-4 pt-5 pb-3 transition-colors hover:bg-cream-bg/40"
          >
            <div className={hasLatestPhoto ? "flex gap-3" : "space-y-1.5"}>
              {hasLatestPhoto && latestPhoto ? (
                <div className="relative h-[80px] w-[110px] shrink-0 overflow-hidden rounded-full border-2 border-white shadow-soft">
                  <Image
                    src={latestPhoto}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="110px"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                {lastVisited ? (
                  <p className="text-xs text-cocoa">
                    {formatVisitDate(lastVisited)}
                  </p>
                ) : null}
                {rating != null ? <RecordStarRating rating={rating} /> : null}
              </div>
            </div>

            {notesSummary ? (
              <p className="mt-3 line-clamp-3 max-w-[calc(100%-6.5rem)] whitespace-pre-wrap text-sm leading-relaxed text-cocoa">
                {notesSummary}
              </p>
            ) : null}
          </Link>
        ) : null}

        {status === "ready" && !hasRecords ? (
          <div className="min-h-[7rem] px-4 pt-5 pb-3">
            <p className="text-sm text-cocoa/60">尚未紀錄</p>
          </div>
        ) : null}

        <Image
          src={homeAssets.recBunny}
          alt=""
          width={100}
          height={100}
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-10 h-[100px] w-[100px] object-contain"
        />

        {status === "ready" && hasRecords ? (
          <Link
            href={`/restaurants/${restaurant.id}/records`}
            className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-sm text-cocoa transition-colors hover:text-deep-brown"
          >
            查看全部美食日記 ({totalRecords})
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        ) : null}

        {status === "ready" && !hasRecords ? (
          <Link
            href={`/restaurants/${restaurant.id}/records/new`}
            className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-sm font-medium text-deep-brown transition-colors hover:text-caramel"
          >
            新增紀錄
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
