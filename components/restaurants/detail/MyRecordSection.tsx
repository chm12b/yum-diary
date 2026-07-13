import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import SectionHeading from "@/components/restaurants/detail/SectionHeading";
import { homeAssets } from "@/src/lib/home-assets";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type MyRecordSectionProps = {
  restaurant: RestaurantDetail;
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

export default function MyRecordSection({ restaurant }: MyRecordSectionProps) {
  const { lastVisited, lastOrder, recordCount, images, imageUrl, records } =
    restaurant;
  const thumbnailUrl = images[0]?.url ?? imageUrl;
  const totalRecords = recordCount ?? records?.length ?? 0;
  const notes = records?.[0]?.notes;

  return (
    <section className="px-5 pt-5 pb-4">
      <div className="relative -mt-[15px] -mb-[5px]">
        <Image
          src={homeAssets.washiTapeKhaki}
          alt=""
          width={100}
          height={100}
          aria-hidden
          className="pointer-events-none absolute top-[31px] right-[-17px] z-10 mb-[10px] h-[100px] w-[100px] rotate-[15deg] object-contain"
        />
        <SectionHeading
          iconSrc={homeAssets.storeMyRec}
          title="我的紀錄"
          iconSize={50}
          className="flex items-center gap-2"
        />
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-rice-white shadow-soft">
        <div className="px-4 pt-5 pb-3">
          <div className="flex gap-3">
            <div className="relative h-[80px] w-[110px] shrink-0 overflow-hidden rounded-full border-2 border-white shadow-soft">
              <Image
                src={thumbnailUrl}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
              {lastVisited ? (
                <p className="text-xs text-cocoa">
                  {formatVisitDate(lastVisited)}
                </p>
              ) : null}
              {lastOrder ? (
                <span className="inline-flex rounded-full bg-sakura-pink/50 px-2.5 py-0.5 text-xs font-medium text-deep-brown">
                  {lastOrder}
                </span>
              ) : null}
            </div>
          </div>

          {notes ? (
            <p className="mt-3 text-sm leading-relaxed text-cocoa">{notes}</p>
          ) : (
            <p className="mt-3 text-sm text-cocoa/60">尚未紀錄</p>
          )}
        </div>

        <Image
          src={homeAssets.recBunny}
          alt=""
          width={100}
          height={100}
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-10 h-[100px] w-[100px] object-contain"
        />

        <Link
          href={`/records/${restaurant.id}`}
          className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-sm text-cocoa transition-colors hover:text-deep-brown"
        >
          查看全部紀錄 ({totalRecords})
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
