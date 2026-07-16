import { MapPin } from "lucide-react";
import Image from "next/image";

import StarRating from "@/components/restaurants/StarRating";
import StatusBadge from "@/components/shared/StatusBadge";
import { homeAssets } from "@/src/lib/home-assets";
import { formatDistance } from "@/src/lib/restaurants/distance";
import { resolvePriceLabel } from "@/src/lib/restaurants/price-level";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type IdentityProps = {
  restaurant: RestaurantDetail;
};

export default function Identity({ restaurant }: IdentityProps) {
  const imageUrl =
    restaurant.images[0]?.url ?? restaurant.imageUrl;
  const hasDistance = restaurant.distanceMeters > 0;
  const priceLabel = resolvePriceLabel(restaurant);

  return (
    <section className="px-5 pt-1 pb-2">
      <div className="flex gap-3">
        <div className="relative w-40 shrink-0">
          <Image
            src={homeAssets.washiTapePink}
            alt=""
            width={60}
            height={80}
            aria-hidden
            className="pointer-events-none absolute -top-[42px] left-1/2 z-10 h-20 w-[60px] -translate-x-1/2 -rotate-2 object-contain"
          />
          <div className="h-[120px] w-40 rounded-xl border-[3px] border-white bg-white p-1.5 shadow-soft">
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <Image
            src={homeAssets.stickerFlowerPink}
            alt=""
            width={36}
            height={36}
            aria-hidden
            className="pointer-events-none absolute -right-1 bottom-1 h-9 w-9 object-contain"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-deep-brown">
              {restaurant.name}
            </h1>
            <Image
              src={homeAssets.stickerFlowerPink}
              alt=""
              width={18}
              height={18}
              aria-hidden
              className="h-[18px] w-[18px] shrink-0 object-contain"
            />
          </div>
          {restaurant.rating > 0 ? (
            <StarRating
              rating={restaurant.rating}
              reviewCount={restaurant.reviewCount}
            />
          ) : null}
          <div className="flex items-center gap-2">
            <p className="min-w-0 truncate text-xs text-cocoa">
              {restaurant.tags.join(" · ")}
            </p>
            <StatusBadge
              status={restaurant.openStatus ?? "unknown"}
              className="shrink-0"
            />
          </div>
          {hasDistance || priceLabel ? (
            <div className="flex items-center gap-3 text-xs text-cocoa">
              {hasDistance ? (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
                  {formatDistance(restaurant.distanceMeters)}
                </span>
              ) : null}
              {priceLabel ? <span>{priceLabel}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
