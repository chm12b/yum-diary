"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

import FoodChipsRow from "@/components/records/FoodChipsRow";
import RecordStarRating from "@/components/records/RecordStarRating";
import { formatCompactVisitDate } from "@/src/lib/format-visit-date";
import { homeAssets } from "@/src/lib/home-assets";

export type MyDiningRecordCardData = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  visitDate: string;
  rating: number;
  notes: string;
  photo: string | null;
  foods: string[];
};

type MyDiningRecordCardProps = {
  record: MyDiningRecordCardData;
};

export default function MyDiningRecordCard({
  record,
}: MyDiningRecordCardProps) {
  const router = useRouter();

  function openRecord() {
    router.push(`/records/${record.id}`);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRecord();
    }
  }

  function openRestaurant(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    router.push(`/restaurants/${record.restaurantId}`);
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`查看 ${record.restaurantName} 的美食日記`}
      onClick={openRecord}
      onKeyDown={handleCardKeyDown}
      className="cursor-pointer rounded-2xl border border-border bg-rice-white px-4 py-4 shadow-soft transition-transform outline-none active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-caramel/40"
    >
      <span className="inline-flex rounded-full bg-sakura-pink/45 px-2.5 py-1 text-xs font-medium text-deep-brown">
        📅 {formatCompactVisitDate(record.visitDate)}
      </span>

      <div className={`mt-3 ${record.photo ? "flex gap-3" : ""}`}>
        {record.photo ? (
          <div className="relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-xl border border-border bg-milk-tea">
            <Image
              src={record.photo}
              alt={`${record.restaurantName} 用餐照片`}
              fill
              className="object-cover"
              sizes="112px"
              loading="lazy"
              decoding="async"
              unoptimized
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openRestaurant}
            onKeyDown={(event) => event.stopPropagation()}
            aria-label={`前往 ${record.restaurantName} 餐廳詳情`}
            className="flex w-full items-center gap-1 text-left text-sm font-medium text-deep-brown transition-colors hover:text-caramel"
          >
            <MapPin
              className="h-4 w-4 shrink-0 text-sakura-pink"
              strokeWidth={2.5}
            />
            <span className="min-w-0 flex-1 truncate">
              {record.restaurantName}
            </span>
            <Image
              src={homeAssets.entryArrow}
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="h-4 w-4 shrink-0 object-contain"
            />
          </button>

          <div className="mt-1.5">
            <RecordStarRating rating={record.rating} />
          </div>

          {record.foods.length > 0 ? (
            <div className="mt-2">
              <FoodChipsRow foods={record.foods} />
            </div>
          ) : null}

          {record.notes.trim() ? (
            <div className="mt-2 flex items-start gap-1.5">
              <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-khaki/60 px-2 text-[10px] font-medium text-deep-brown">
                心得
              </span>
              <p className="line-clamp-2 text-xs leading-relaxed text-cocoa">
                {record.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
