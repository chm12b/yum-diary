import DetailHeader from "@/components/restaurants/detail/DetailHeader";
import HeroGallery from "@/components/restaurants/detail/HeroGallery";
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
    <>
      <div className="relative">
        <HeroGallery images={restaurant.images} fallbackAlt={restaurant.name} />
        <div className="absolute inset-x-0 top-0 z-10">
          <DetailHeader isFavorite={restaurant.isFavorite} />
        </div>
      </div>
      <Identity restaurant={restaurant} />
      <RestaurantInfoList restaurant={restaurant} />
      <MyRecordSection restaurant={restaurant} />
      <MenuSection menuImages={restaurant.menuImages} alt={restaurant.name} />
    </>
  );
}
