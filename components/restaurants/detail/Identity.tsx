import Image from "next/image";

import StarRating from "@/components/restaurants/StarRating";
import { homeAssets } from "@/src/lib/home-assets";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type IdentityProps = {
  restaurant: RestaurantDetail;
};

export default function Identity({ restaurant }: IdentityProps) {
  const imageUrl =
    restaurant.images[0]?.url ?? restaurant.imageUrl;

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
              {restaurant.websiteUrl ? (
                <a
                  href={restaurant.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {restaurant.name}
                </a>
              ) : (
                restaurant.name
              )}
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
          <StarRating
            rating={restaurant.rating}
            reviewCount={restaurant.reviewCount}
          />
          <p className="text-xs text-cocoa">{restaurant.tags.join(" · ")}</p>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              restaurant.isOpen
                ? "bg-[#e8f5e9] text-[#5a9e5c]"
                : "bg-soft-gray text-cocoa"
            }`}
          >
            {restaurant.isOpen ? "營業中" : "已打烊"}
          </span>
        </div>
      </div>
    </section>
  );
}
