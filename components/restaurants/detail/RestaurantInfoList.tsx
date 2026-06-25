import {
  ChevronRight,
  Clock,
  Copy,
  MapPin,
  Phone,
} from "lucide-react";

import RestaurantInfoItem from "@/components/restaurants/detail/RestaurantInfoItem";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type RestaurantInfoListProps = {
  restaurant: RestaurantDetail;
};

export default function RestaurantInfoList({
  restaurant,
}: RestaurantInfoListProps) {
  const { openingHours, phoneNumber, address } = restaurant;

  return (
    <section className="px-5 pt-4">
      <div className="divide-y divide-warm-gray overflow-hidden rounded-2xl bg-rice-white">
        <RestaurantInfoItem
          icon={Clock}
          title="營業時間"
          value={openingHours.slots.join("\n")}
          subtitle={openingHours.todayStatusLabel}
          trailing={
            <ChevronRight className="h-5 w-5 text-cocoa" strokeWidth={2} />
          }
        />
        {phoneNumber ? (
          <RestaurantInfoItem
            icon={Phone}
            title="電話"
            value={phoneNumber}
            trailing={
              <button
                type="button"
                aria-label="撥打電話"
                className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa"
              >
                <Phone className="h-4 w-4" strokeWidth={2} />
              </button>
            }
          />
        ) : null}
        {address ? (
          <RestaurantInfoItem
            icon={MapPin}
            title="地址"
            value={address}
            trailing={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="複製地址"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa"
                >
                  <Copy className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="開啟地圖"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa"
                >
                  <MapPin className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            }
          />
        ) : null}
      </div>
    </section>
  );
}
