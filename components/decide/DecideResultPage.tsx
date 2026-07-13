import DecideActions from "@/components/decide/DecideActions";
import DecideBunny from "@/components/decide/DecideBunny";
import DecideHeader from "@/components/decide/DecideHeader";
import DecideHeroPhoto from "@/components/decide/DecideHeroPhoto";
import DecideRestaurantName from "@/components/decide/DecideRestaurantName";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type DecideResultPageProps = {
  restaurant: RestaurantDetail;
};

export default function DecideResultPage({ restaurant }: DecideResultPageProps) {
  const imageUrl = restaurant.images[0]?.url ?? restaurant.imageUrl;

  return (
    <div className="home-grid-bg min-h-full">
      <DecideHeader />
      <DecideBunny />
      <DecideHeroPhoto imageUrl={imageUrl} alt={restaurant.name} />
      <DecideRestaurantName name={restaurant.name} />
      <DecideActions restaurantId={restaurant.id} />
    </div>
  );
}
