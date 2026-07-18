import { Heart, MapPin } from "lucide-react";
import Image from "next/image";

import StarRating from "@/components/restaurants/StarRating";
import StatusBadge from "@/components/shared/StatusBadge";
import { homeAssets } from "@/src/lib/home-assets";
import { formatDistance } from "@/src/lib/restaurants/distance";
import { resolvePriceLabel } from "@/src/lib/restaurants/price-level";
import type { Restaurant } from "@/src/lib/restaurant-types";

type RestaurantCardProps = {
  restaurant: Restaurant;
  onClick?: () => void;
  onFavoriteClick?: () => void;
};

export default function RestaurantCard({
  restaurant,
  onClick,
  onFavoriteClick,
}: RestaurantCardProps) {
  const hasRating = restaurant.rating > 0;
  const hasDistance = restaurant.distanceMeters > 0;
  const priceLabel = resolvePriceLabel(restaurant);

  return (
    <article
      className="relative flex w-full gap-3 rounded-[1.25rem] border border-border bg-rice-white px-3 pt-3 pb-0 text-left shadow-soft"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`查看 ${restaurant.name}`}
        className="absolute inset-0 rounded-[1.25rem]"
      />

      <div className="pointer-events-none relative z-10 shrink-0">
        <div className="h-[100px] w-[120px] rounded-xl border-[3px] border-white bg-white p-1 shadow-soft">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <Image
          src={homeAssets.stickerFlowerPink}
          alt=""
          width={40}
          height={40}
          aria-hidden
          className="pointer-events-none absolute -right-1.5 bottom-2 h-10 w-10 translate-x-[0.3rem] translate-y-0 object-contain"
        />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-[100px] min-w-0 flex-1 flex-col gap-1.5 pb-7 pr-6">
        <h2 className="truncate font-bold text-deep-brown">{restaurant.name}</h2>
        {hasRating ? (
          <StarRating
            rating={restaurant.rating}
            reviewCount={restaurant.reviewCount}
          />
        ) : null}
        <p className="truncate text-xs text-cocoa">
          {restaurant.tags.join(" · ")}
        </p>
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

      {onFavoriteClick ? (
        <button
          type="button"
          onClick={onFavoriteClick}
          aria-label={restaurant.isFavorite ? "取消收藏" : "加入收藏"}
          aria-pressed={restaurant.isFavorite}
          className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center"
        >
          <Heart
            className={`h-5 w-5 shrink-0 ${
              restaurant.isFavorite
                ? "fill-sakura-pink text-caramel"
                : "text-cocoa/40"
            }`}
            strokeWidth={2}
          />
        </button>
      ) : (
        <Heart
          className={`pointer-events-none absolute top-3 right-3 z-10 h-5 w-5 shrink-0 ${
            restaurant.isFavorite
              ? "fill-sakura-pink text-caramel"
              : "text-cocoa/40"
          }`}
          strokeWidth={2}
          aria-hidden
        />
      )}

      <StatusBadge
        status={restaurant.openStatus ?? "unknown"}
        className="pointer-events-none absolute right-3 bottom-3 z-10"
      />
    </article>
  );
}
