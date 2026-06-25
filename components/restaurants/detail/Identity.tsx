import OpenStatusBadge from "@/components/restaurants/OpenStatusBadge";
import StarRating from "@/components/restaurants/StarRating";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";
import { categoryFilters } from "@/src/lib/restaurants-data";

type IdentityProps = {
  restaurant: RestaurantDetail;
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

export default function Identity({ restaurant }: IdentityProps) {
  const categoryLabel = categoryFilters.find(
    (item) => item.id === restaurant.category,
  )?.label;

  return (
    <section className="px-5 pt-4">
      <h1 className="text-2xl font-bold text-deep-brown">{restaurant.name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <StarRating
          rating={restaurant.rating}
          reviewCount={restaurant.reviewCount}
        />
        <OpenStatusBadge isOpen={restaurant.isOpen} />
      </div>
      <p className="mt-2 text-sm text-cocoa">
        {[categoryLabel, formatPrice(restaurant.averagePrice), formatDistance(restaurant.distanceMeters)]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </section>
  );
}
