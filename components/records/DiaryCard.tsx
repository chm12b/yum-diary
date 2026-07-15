import Image from "next/image";
import Link from "next/link";

import RecordStarRating from "@/components/records/RecordStarRating";
import { formatVisitDate } from "@/src/lib/format-visit-date";
import { homeAssets } from "@/src/lib/home-assets";
import type { DiaryRecord } from "@/src/lib/restaurant-types";

type DiaryCardProps = {
  record: DiaryRecord;
};

const dateTagColors = {
  pink: "bg-sakura-pink/60",
  yellow: "bg-amber-100",
  green: "bg-green-100",
} as const;

const orderHighlightColors = {
  pink: "bg-sakura-pink/40",
  yellow: "bg-amber-100/80",
  green: "bg-green-100/80",
} as const;

export default function DiaryCard({ record }: DiaryCardProps) {
  const dateTagColor = dateTagColors[record.dateTagColor ?? "pink"];
  const orderHighlightColor =
    orderHighlightColors[record.orderHighlightColor ?? "pink"];
  const washiTapeSrc =
    record.washiTape === "khaki"
      ? homeAssets.washiTapeKhaki
      : homeAssets.washiTapePink;
  const photoRotation = record.photoRotation ?? 3;
  const hasPhoto = Boolean(record.photo);
  const hasOrder = Boolean(record.order.trim());

  return (
    <Link
      href={`/records/${record.id}`}
      className="block transition-transform active:scale-[0.99]"
    >
      <article className="relative overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        <div className="px-4 pt-4 pb-4">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-deep-brown ${dateTagColor}`}
          >
            📅 {formatVisitDate(record.visitDate)}
          </span>

          <div className="mt-3 flex gap-3">
            {hasPhoto ? (
              <div className="relative shrink-0">
                <Image
                  src={washiTapeSrc}
                  alt=""
                  width={48}
                  height={20}
                  aria-hidden
                  className="pointer-events-none absolute -top-2 left-1 z-10 h-5 w-12 -rotate-12 object-contain"
                />
                <div
                  className="w-[88px] rounded-lg border-[3px] border-white bg-white p-1 shadow-soft"
                  style={{ transform: `rotate(${photoRotation}deg)` }}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                      src={record.photo}
                      alt={record.order || "用餐照片"}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="min-w-0 flex-1 space-y-2 pt-1">
              <RecordStarRating rating={record.rating} />
              {hasOrder ? (
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-deep-brown ${orderHighlightColor}`}
                >
                  {record.order}
                </span>
              ) : null}
            </div>
          </div>

          {record.notes.trim() ? (
            <div className="mt-3 flex gap-2">
              <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-khaki/60 px-2 text-[10px] font-medium text-deep-brown">
                心得
              </span>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-cocoa">
                {record.notes}
              </p>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
