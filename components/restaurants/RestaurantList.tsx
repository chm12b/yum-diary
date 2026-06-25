import RestaurantCard from "@/components/restaurants/RestaurantCard";
import type { Restaurant } from "@/src/lib/restaurant-types";

type RestaurantListProps = {
  restaurants: Restaurant[];
};

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <div className="flex flex-col gap-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
