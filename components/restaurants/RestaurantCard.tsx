import { Heart } from "lucide-react";
import Image from "next/image";

import OpenStatusBadge from "@/components/restaurants/OpenStatusBadge";
import StarRating from "@/components/restaurants/StarRating";
import type { Restaurant } from "@/src/lib/restaurant-types";
import { categoryFilters } from "@/src/lib/restaurants-data";

type RestaurantCardProps = {
  restaurant: Restaurant;
  onClick?: () => void;
};

function formatDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${distanceMeters} m`;
}

function formatPrice(averagePrice: number): string {
  return `$${averagePrice}`;
}

export default function RestaurantCard({
  restaurant,
  onClick,
}: RestaurantCardProps) {
  const categoryLabel = categoryFilters.find(
    (item) => item.id === restaurant.category,
  )?.label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full gap-3 rounded-2xl bg-rice-white p-3 text-left"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-6">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-bold text-deep-brown">
            {restaurant.name}
          </h2>
          {categoryLabel ? (
            <span className="shrink-0 text-xs text-cocoa">{categoryLabel}</span>
          ) : null}
        </div>
        <StarRating
          rating={restaurant.rating}
          reviewCount={restaurant.reviewCount}
        />
        <OpenStatusBadge isOpen={restaurant.isOpen} />
        <p className="text-sm text-cocoa">
          {formatDistance(restaurant.distanceMeters)} ·{" "}
          {formatPrice(restaurant.averagePrice)}
        </p>
      </div>
      <Heart
        className={`absolute top-3 right-3 h-5 w-5 shrink-0 ${
          restaurant.isFavorite
            ? "fill-caramel text-caramel"
            : "text-cocoa/50"
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
