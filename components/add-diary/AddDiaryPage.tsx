import AddDiaryBunnyHero from "@/components/add-diary/AddDiaryBunnyHero";
import AddDiaryFooter from "@/components/add-diary/AddDiaryFooter";
import AddDiaryFormCard from "@/components/add-diary/AddDiaryFormCard";
import AddDiaryHeader from "@/components/add-diary/AddDiaryHeader";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type AddDiaryPageProps = {
  restaurant: RestaurantDetail;
};

export default function AddDiaryPage({ restaurant }: AddDiaryPageProps) {
  return (
    <div className="home-grid-bg min-h-full">
      <AddDiaryHeader restaurantId={restaurant.id} />
      <AddDiaryBunnyHero />
      <AddDiaryFormCard />
      <AddDiaryFooter />
    </div>
  );
}
