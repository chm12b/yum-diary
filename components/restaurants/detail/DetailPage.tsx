import DetailActionBar from "@/components/restaurants/detail/DetailActionBar";
import DetailHeader from "@/components/restaurants/detail/DetailHeader";
import Identity from "@/components/restaurants/detail/Identity";
import MenuSection from "@/components/restaurants/detail/MenuSection";
import MyRecordSection from "@/components/restaurants/detail/MyRecordSection";
import RestaurantInfoList from "@/components/restaurants/detail/RestaurantInfoList";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type DetailPageProps = {
  restaurant: RestaurantDetail;
};

export default function DetailPage({ restaurant }: DetailPageProps) {
  return (
    <div className="home-grid-bg min-h-full pb-6">
      <DetailHeader isFavorite={restaurant.isFavorite} />
      <Identity restaurant={restaurant} />
      <RestaurantInfoList restaurant={restaurant} />
      <MenuSection menuImages={restaurant.menuImages} alt={restaurant.name} />
      <MyRecordSection restaurant={restaurant} />
      <DetailActionBar isFavorite={restaurant.isFavorite} />
    </div>
  );
}
