import { notFound } from "next/navigation";

import AddDiaryPage from "@/components/add-diary/AddDiaryPage";
import { getRestaurantDetailById } from "@/src/lib/restaurant-details-data";

type AddDiaryRouteProps = {
  params: Promise<{ restaurantId: string }>;
};

export default async function AddDiaryRoute({ params }: AddDiaryRouteProps) {
  const { restaurantId } = await params;
  const restaurant = getRestaurantDetailById(restaurantId);

  if (!restaurant) {
    notFound();
  }

  return <AddDiaryPage restaurant={restaurant} />;
}
