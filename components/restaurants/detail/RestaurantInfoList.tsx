import { Clock, Globe, MapPin, NotebookPen, Phone, CalendarOff } from "lucide-react";
import Image from "next/image";

import RestaurantInfoItem from "@/components/restaurants/detail/RestaurantInfoItem";
import { homeAssets } from "@/src/lib/home-assets";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type RestaurantInfoListProps = {
  restaurant: RestaurantDetail;
};

export default function RestaurantInfoList({
  restaurant,
}: RestaurantInfoListProps) {
  const { openingHours, phoneNumber, address, websiteUrl, notes } = restaurant;
  const closedDaysLabel =
    openingHours.closedDays.length > 0
      ? openingHours.closedDays.join("、")
      : "無固定公休";

  return (
    <section className="relative px-5 pt-4">
      <div className="relative mb-3">
        <div className="-mb-[3px] flex items-center gap-2">
          <Image
            src={homeAssets.storeInfo}
            alt=""
            width={40}
            height={30}
            aria-hidden
            className="object-contain"
            style={{ width: 40, height: 30 }}
          />
          <h2 className="text-base font-bold text-deep-brown">店家資訊</h2>
        </div>
        <Image
          src={homeAssets.detailBunny}
          alt=""
          width={160}
          height={160}
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 z-10 h-40 w-40 object-contain"
        />
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-rice-white px-2 py-4 shadow-soft">
        <div className="grid grid-cols-2 gap-y-5">
          <RestaurantInfoItem
            icon={Clock}
            title="營業時間"
            value={openingHours.slots.join("\n")}
          />
          {address ? (
            <RestaurantInfoItem icon={MapPin} title="地址" value={address} />
          ) : null}
          {phoneNumber ? (
            <RestaurantInfoItem icon={Phone} title="電話" value={phoneNumber} />
          ) : null}
          <RestaurantInfoItem
            icon={CalendarOff}
            title="公休日"
            value={closedDaysLabel}
          />
          {websiteUrl ? (
            <RestaurantInfoItem
              icon={Globe}
              title="官方網站"
              value={websiteUrl}
            />
          ) : null}
          {notes ? (
            <RestaurantInfoItem
              icon={NotebookPen}
              title="備註"
              value={notes}
            />
          ) : null}
        </div>
        <Image
          src={homeAssets.stickerFlowerPink}
          alt=""
          width={24}
          height={24}
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-2 h-6 w-6 object-contain opacity-80"
        />
      </div>
    </section>
  );
}
