import RestaurantCard from "@/components/restaurants/RestaurantCard";
import type { Restaurant } from "@/src/lib/restaurant-types";

type RestaurantListProps = {
  restaurants: Restaurant[];
  onRestaurantClick?: (id: string) => void;
  onFavoriteClick?: (id: string) => void;
};

export default function RestaurantList({
  restaurants,
  onRestaurantClick,
  onFavoriteClick,
}: RestaurantListProps) {
  return (
    <div className="flex flex-col gap-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onClick={() => onRestaurantClick?.(restaurant.id)}
          onFavoriteClick={
            onFavoriteClick
              ? () => onFavoriteClick(restaurant.id)
              : undefined
          }
        />
      ))}
    </div>
  );
}
